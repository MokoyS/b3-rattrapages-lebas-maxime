<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Cart;
use App\Enum\CartStatus;
use App\Repository\CartRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ValidateCartProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly CartRepository $cartRepository,
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

        if ($cart->getItems()->isEmpty()) {
            throw new UnprocessableEntityHttpException('Impossible de valider un panier vide.');
        }

        $cart->setStatus(CartStatus::Validated);
        $this->entityManager->flush();

        return $cart;
    }
}
