<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Dto\RatingInput;
use App\Repository\ProductRepository;
use App\State\RateProductProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(normalizationContext: ['groups' => ['read']]),
        new Get(normalizationContext: ['groups' => ['read']]),
        new Post(
            uriTemplate: '/products/{id}/ratings',
            status: 200,
            input: RatingInput::class,
            output: Product::class,
            processor: RateProductProcessor::class,
            normalizationContext: ['groups' => ['read']],
            name: 'rate',
        ),
    ],
)]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['read'])]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Groups(['read'])]
    #[Assert\NotBlank]
    private string $name = '';

    #[ORM\Column(length: 500)]
    #[Groups(['read'])]
    private string $image = '';

    #[ORM\Column(type: 'text')]
    #[Groups(['read'])]
    private string $description = '';

    #[ORM\Column]
    #[Groups(['read'])]
    #[Assert\Positive]
    private float $price = 0.0;

    #[ORM\Column(nullable: true)]
    #[Groups(['read'])]
    private ?float $rating = null;

    #[ORM\Column]
    #[Groups(['read'])]
    private bool $available = true;

    #[ORM\OneToMany(targetEntity: Rating::class, mappedBy: 'product', cascade: ['persist'], orphanRemoval: true)]
    private Collection $ratings;

    public function __construct()
    {
        $this->ratings = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getImage(): string
    {
        return $this->image;
    }

    public function setImage(string $image): static
    {
        $this->image = $image;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getRating(): ?float
    {
        return $this->rating;
    }

    public function setRating(?float $rating): static
    {
        $this->rating = $rating;

        return $this;
    }

    public function isAvailable(): bool
    {
        return $this->available;
    }

    public function setAvailable(bool $available): static
    {
        $this->available = $available;

        return $this;
    }

    public function getRatings(): Collection
    {
        return $this->ratings;
    }

    public function addRating(Rating $rating): static
    {
        if (!$this->ratings->contains($rating)) {
            $this->ratings->add($rating);
            $rating->setProduct($this);
        }

        return $this;
    }

    public function recomputeRating(): static
    {
        if ($this->ratings->isEmpty()) {
            $this->rating = null;

            return $this;
        }

        $sum = 0;
        foreach ($this->ratings as $existingRating) {
            $sum += $existingRating->getScore();
        }

        $this->rating = round($sum / $this->ratings->count(), 2);

        return $this;
    }
}
