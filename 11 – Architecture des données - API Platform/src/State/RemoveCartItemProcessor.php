<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Cart;
use App\Enum\CartStatus;
use App\Repository\CartItemRepository;
use App\Repository\CartRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class RemoveCartItemProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly CartRepository $cartRepository,
        private readonly CartItemRepository $cartItemRepository,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Cart
    {
        $cart = $this->cartRepository->find($uriVariables['cartId']);
        if (!$cart instanceof Cart) {
            throw new NotFoundHttpException('Panier introuvable.');
        }

        if (CartStatus::Open !== $cart->getStatus()) {
            throw new UnprocessableEntityHttpException('Ce panier a déjà été validé.');
        }

        $item = $this->cartItemRepository->find($uriVariables['itemId']);
        if (!$item || $item->getCart() !== $cart) {
            throw new NotFoundHttpException('Produit introuvable dans ce panier.');
        }

        $cart->removeItem($item);
        $this->entityManager->remove($item);
        $this->entityManager->flush();

        return $cart;
    }
}
