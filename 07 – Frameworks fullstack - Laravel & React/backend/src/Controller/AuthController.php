<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'app_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        Security $security,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $firstName = trim((string) ($data['firstName'] ?? ''));
        $lastName = trim((string) ($data['lastName'] ?? ''));

        $violations = $validator->validate($email, [new Assert\NotBlank(), new Assert\Email()]);
        $violations->addAll($validator->validate($password, [new Assert\NotBlank(), new Assert\Length(min: 8)]));
        $violations->addAll($validator->validate($firstName, [new Assert\NotBlank()]));
        $violations->addAll($validator->validate($lastName, [new Assert\NotBlank()]));

        if (count($violations) > 0) {
            return $this->json(['error' => (string) $violations], 422);
        }

        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->json(['error' => 'Un compte existe déjà avec cet email.'], 409);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setLoyaltyCardNumber($this->generateLoyaltyCardNumber());

        $em->persist($user);
        $em->flush();

        $security->login($user, firewallName: 'main');

        return $this->json($this->serializeUser($user), 201);
    }

    #[Route('/login', name: 'app_login', methods: ['POST'])]
    public function login(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        Security $security,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Email ou mot de passe incorrect.'], 401);
        }

        $security->login($user, firewallName: 'main');

        return $this->json($this->serializeUser($user));
    }

    #[Route('/logout', name: 'app_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // Intercepté par le firewall Symfony (config/packages/security.yaml).
        throw new \LogicException('Cette méthode ne devrait jamais être appelée.');
    }

    #[Route('/me', name: 'app_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié.'], 401);
        }

        return $this->json($this->serializeUser($user));
    }

    private function generateLoyaltyCardNumber(): string
    {
        return 'PIC-' . strtoupper(bin2hex(random_bytes(4)));
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'loyaltyCardNumber' => $user->getLoyaltyCardNumber(),
            'loyaltyPoints' => $user->getLoyaltyPoints(),
            'memberSince' => $user->getCreatedAt()->format('Y-m-d'),
        ];
    }
}
