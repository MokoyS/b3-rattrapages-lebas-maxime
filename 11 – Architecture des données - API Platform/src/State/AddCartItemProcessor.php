<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Cart;
use App\Entity\CartItem;
use App\Enum\CartStatus;
use App\Repository\CartRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AddCartItemProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly CartRepository $cartRepository,
        private readonly ProductRepository $productRepository,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Cart
    {
        $cart = $this->cartRepository->find($uriVariables['id']);
        if (!$cart instanceof Cart) {
            throw new NotFoundHttpException('Panier introuvable.');
        }

        if (CartStatus::Open !== $cart->getStatus()) {
            throw new UnprocessableEntityHttpException('Ce panier a déjà été validé.');
        }

        $product = $this->productRepository->find($data->productId);
        if (!$product) {
            throw new NotFoundHttpException('Produit introuvable.');
        }

        $existingItem = null;
        foreach ($cart->getItems() as $item) {
            if ($item->getProduct() === $product) {
                $existingItem = $item;
                break;
            }
        }

        if ($existingItem) {
            $existingItem->setQuantity($existingItem->getQuantity() + $data->quantity);
        } else {
            $newItem = new CartItem();
            $newItem->setProduct($product);
            $newItem->setQuantity($data->quantity);
            $cart->addItem($newItem);
        }

        $this->entityManager->flush();

        return $cart;
    }
}
