<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/loyalty')]
class LoyaltyController extends AbstractController
{
    #[Route('', name: 'app_loyalty_show', methods: ['GET'])]
    public function show(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $ordersCount = $user->getOrders()->count();

        return $this->json([
            'loyaltyCardNumber' => $user->getLoyaltyCardNumber(),
            'loyaltyPoints' => $user->getLoyaltyPoints(),
            'memberSince' => $user->getCreatedAt()->format('Y-m-d'),
            'ordersCount' => $ordersCount,
        ]);
    }
}
