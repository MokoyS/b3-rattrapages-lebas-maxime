<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\ProductRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/products')]
class ProductController extends AbstractController
{
    #[Route('', name: 'app_products_list', methods: ['GET'])]
    public function list(ProductRepository $productRepository): JsonResponse
    {
        $products = $productRepository->findBy(['isAvailable' => true], ['category' => 'ASC', 'name' => 'ASC']);

        return $this->json(array_map([$this, 'serialize'], $products));
    }

    #[Route('/{id}', name: 'app_products_show', methods: ['GET'])]
    public function show(Product $product): JsonResponse
    {
        return $this->json($this->serialize($product));
    }

    private function serialize(Product $product): array
    {
        return [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'category' => $product->getCategory(),
            'priceCents' => $product->getPriceCents(),
            'stock' => $product->getStock(),
            'imageUrl' => $product->getImageUrl(),
        ];
    }
}
