<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\User;
use App\Repository\ProductRepository;
use App\Service\CardValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/orders')]
class OrderController extends AbstractController
{
    #[Route('', name: 'app_orders_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $orders = $user->getOrders()->toArray();
        usort($orders, fn (Order $a, Order $b) => $b->getCreatedAt() <=> $a->getCreatedAt());

        return $this->json(array_map([$this, 'serialize'], $orders));
    }

    #[Route('', name: 'app_orders_create', methods: ['POST'])]
    public function create(
        Request $request,
        ProductRepository $productRepository,
        CardValidator $cardValidator,
        EntityManagerInterface $em,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true) ?? [];
        $items = $data['items'] ?? [];
        $card = $data['card'] ?? [];

        if (!is_array($items) || count($items) === 0) {
            return $this->json(['error' => 'Le panier est vide.'], 422);
        }

        $cardErrors = $cardValidator->validate(
            (string) ($card['number'] ?? ''),
            (string) ($card['expiryMonth'] ?? ''),
            (string) ($card['expiryYear'] ?? ''),
            (string) ($card['cvv'] ?? ''),
        );

        if (count($cardErrors) > 0) {
            return $this->json(['error' => 'Paiement refusé.', 'details' => $cardErrors], 422);
        }

        $order = new Order();
        $order->setUser($user);
        $totalCents = 0;

        foreach ($items as $line) {
            $productId = (int) ($line['productId'] ?? 0);
            $quantity = (int) ($line['quantity'] ?? 0);

            if ($quantity < 1) {
                return $this->json(['error' => 'Quantité invalide.'], 422);
            }

            $product = $productRepository->find($productId);

            if (!$product || !$product->isAvailable()) {
                return $this->json(['error' => 'Un produit du panier n\'est plus disponible.'], 422);
            }

            if ($product->getStock() < $quantity) {
                return $this->json(['error' => sprintf('Stock insuffisant pour "%s".', $product->getName())], 422);
            }

            $orderItem = new OrderItem();
            $orderItem->setProduct($product);
            $orderItem->setProductName($product->getName());
            $orderItem->setUnitPriceCents($product->getPriceCents());
            $orderItem->setQuantity($quantity);

            $order->addItem($orderItem);
            $totalCents += $product->getPriceCents() * $quantity;

            $product->setStock($product->getStock() - $quantity);
        }

        $cardDigits = preg_replace('/\D/', '', (string) ($card['number'] ?? ''));
        $pointsEarned = intdiv($totalCents, 100);

        $order->setTotalCents($totalCents);
        $order->setCardLast4(substr($cardDigits, -4));
        $order->setPointsEarned($pointsEarned);
        $order->setStatus(Order::STATUS_PAID);

        $user->addLoyaltyPoints($pointsEarned);

        $em->persist($order);
        $em->flush();

        return $this->json($this->serialize($order), 201);
    }

    private function serialize(Order $order): array
    {
        return [
            'id' => $order->getId(),
            'createdAt' => $order->getCreatedAt()->format(\DATE_ATOM),
            'totalCents' => $order->getTotalCents(),
            'status' => $order->getStatus(),
            'cardLast4' => $order->getCardLast4(),
            'pointsEarned' => $order->getPointsEarned(),
            'items' => array_map(static fn (OrderItem $item) => [
                'productName' => $item->getProductName(),
                'unitPriceCents' => $item->getUnitPriceCents(),
                'quantity' => $item->getQuantity(),
            ], $order->getItems()->toArray()),
        ];
    }
}
