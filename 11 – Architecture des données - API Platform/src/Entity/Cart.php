<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use App\Dto\AddCartItemInput;
use App\Enum\CartStatus;
use App\Repository\CartRepository;
use App\State\AddCartItemProcessor;
use App\State\CreateCartProcessor;
use App\State\RemoveCartItemProcessor;
use App\State\ValidateCartProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: CartRepository::class)]
#[ApiResource(
    operations: [
        new Post(
            input: false,
            processor: CreateCartProcessor::class,
            normalizationContext: ['groups' => ['read']],
        ),
        new Get(normalizationContext: ['groups' => ['read']]),
        new Post(
            uriTemplate: '/carts/{id}/items',
            status: 200,
            input: AddCartItemInput::class,
            output: Cart::class,
            processor: AddCartItemProcessor::class,
            normalizationContext: ['groups' => ['read']],
            name: 'add_item',
        ),
        new Delete(
            uriTemplate: '/carts/{cartId}/items/{itemId}',
            uriVariables: [
                'cartId' => new Link(fromClass: Cart::class, identifiers: ['id']),
                'itemId' => new Link(fromClass: CartItem::class, identifiers: ['id']),
            ],
            status: 200,
            read: false,
            output: Cart::class,
            processor: RemoveCartItemProcessor::class,
            normalizationContext: ['groups' => ['read']],
            name: 'remove_item',
        ),
        new Post(
            uriTemplate: '/carts/{id}/validate',
            status: 200,
            input: false,
            output: Cart::class,
            processor: ValidateCartProcessor::class,
            normalizationContext: ['groups' => ['read']],
            name: 'validate',
        ),
    ],
)]
class Cart
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['read'])]
    private ?int $id = null;

    #[ORM\Column(length: 20, enumType: CartStatus::class)]
    #[Groups(['read'])]
    private CartStatus $status = CartStatus::Open;

    #[ORM\Column]
    #[Groups(['read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\OneToMany(targetEntity: CartItem::class, mappedBy: 'cart', cascade: ['persist'], orphanRemoval: true)]
    #[Groups(['read'])]
    private Collection $items;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->items = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStatus(): CartStatus
    {
        return $this->status;
    }

    public function setStatus(CartStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(CartItem $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setCart($this);
        }

        return $this;
    }

    public function removeItem(CartItem $item): static
    {
        $this->items->removeElement($item);

        return $this;
    }
}
