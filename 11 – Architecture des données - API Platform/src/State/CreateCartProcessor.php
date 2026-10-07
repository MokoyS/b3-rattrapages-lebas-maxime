<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Cart;
use Doctrine\ORM\EntityManagerInterface;

class CreateCartProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Cart
    {
        $cart = new Cart();

        $this->entityManager->persist($cart);
        $this->entityManager->flush();

        return $cart;
    }
}
