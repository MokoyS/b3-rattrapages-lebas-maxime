<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class AddCartItemInput
{
    #[Assert\NotNull]
    #[Assert\Positive]
    public ?int $productId = null;

    #[Assert\Positive]
    public int $quantity = 1;
}
