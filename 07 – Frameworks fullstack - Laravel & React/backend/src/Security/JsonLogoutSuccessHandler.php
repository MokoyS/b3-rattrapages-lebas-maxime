<?php

namespace App\Security;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Event\LogoutEvent;

#[AsEventListener]
class JsonLogoutSuccessHandler
{
    public function __invoke(LogoutEvent $event): void
    {
        $event->setResponse(new JsonResponse(['success' => true]));
    }
}
