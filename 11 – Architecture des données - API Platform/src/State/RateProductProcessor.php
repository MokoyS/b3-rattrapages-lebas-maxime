<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Product;
use App\Entity\Rating;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RateProductProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ProductRepository $productRepository,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Product
    {
        $product = $this->productRepository->find($uriVariables['id']);
        if (!$product instanceof Product) {
            throw new NotFoundHttpException('Produit introuvable.');
        }

        $rating = new Rating();
        $rating->setScore($data->score);
        $product->addRating($rating);
        $product->recomputeRating();

        $this->entityManager->persist($rating);
        $this->entityManager->flush();

        return $product;
    }
}
