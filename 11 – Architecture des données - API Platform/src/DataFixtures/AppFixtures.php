<?php

namespace App\DataFixtures;

use App\Entity\Product;
use App\Entity\Rating;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class AppFixtures extends Fixture
{
    private const PRODUCTS = [
        ['name' => 'Lasagnes à la bolognaise', 'description' => 'Lasagnes gratinées à la viande de bœuf et sauce tomate maison.', 'category' => 'plats-cuisines', 'price' => 4.90],
        ['name' => 'Gratin dauphinois', 'description' => 'Pommes de terre fondantes cuites lentement dans une crème onctueuse.', 'category' => 'plats-cuisines', 'price' => 3.50],
        ['name' => 'Poulet rôti et sa garniture', 'description' => 'Filet de poulet rôti accompagné de légumes de saison.', 'category' => 'plats-cuisines', 'price' => 5.90],
        ['name' => 'Filet de saumon nature', 'description' => 'Filet de saumon sans peau et sans arêtes, à cuire au four ou à la poêle.', 'category' => 'poissons', 'price' => 6.50],
        ['name' => 'Cabillaud meunière', 'description' => 'Dos de cabillaud légèrement pané, cuisson à la poêle en quelques minutes.', 'category' => 'poissons', 'price' => 6.90],
        ['name' => 'Crevettes décortiquées', 'description' => 'Crevettes sauvages décortiquées, idéales pour un wok ou une salade.', 'category' => 'poissons', 'price' => 7.20],
        ['name' => 'Haricots verts extra-fins', 'description' => 'Haricots verts extra-fins surgelés juste après récolte.', 'category' => 'legumes', 'price' => 2.30],
        ['name' => 'Poêlée de légumes du soleil', 'description' => 'Courgettes, poivrons et tomates façon ratatouille.', 'category' => 'legumes', 'price' => 2.80],
        ['name' => 'Épinards hachés', 'description' => 'Épinards hachés surgelés, prêts à cuisiner.', 'category' => 'legumes', 'price' => 2.10],
        ['name' => 'Frites croustillantes', 'description' => 'Frites de pommes de terre, croustillantes à cœur fondant.', 'category' => 'legumes', 'price' => 2.60],
        ['name' => 'Tarte au citron meringuée', 'description' => 'Pâte sablée, crème citron et meringue légère.', 'category' => 'desserts', 'price' => 4.20],
        ['name' => 'Moelleux au chocolat', 'description' => 'Cœur coulant au chocolat noir, à réchauffer quelques minutes.', 'category' => 'desserts', 'price' => 3.90],
        ['name' => 'Tarte tatin', 'description' => 'Pommes caramélisées sur une pâte feuilletée croustillante.', 'category' => 'desserts', 'price' => 4.50],
        ['name' => 'Macarons assortis', 'description' => "Assortiment de macarons aux parfums variés.", 'category' => 'desserts', 'price' => 5.50],
        ['name' => 'Glace vanille de Madagascar', 'description' => 'Glace onctueuse à la vanille de Madagascar.', 'category' => 'glaces', 'price' => 4.80],
        ['name' => 'Sorbet plein fruit citron', 'description' => 'Sorbet gourmand préparé avec du jus de citron.', 'category' => 'glaces', 'price' => 4.60],
        ['name' => 'Bâtonnets glacés chocolat', 'description' => 'Bâtonnets vanille enrobés de chocolat croustillant.', 'category' => 'glaces', 'price' => 5.20],
        ['name' => 'Bouchées apéritives assorties', 'description' => 'Assortiment de feuilletés et bouchées à réchauffer au four.', 'category' => 'apero', 'price' => 4.40],
        ['name' => 'Nems au poulet', 'description' => 'Nems croustillants garnis de poulet et vermicelles.', 'category' => 'apero', 'price' => 3.80],
        ['name' => 'Mini blinis nature', 'description' => 'Mini blinis moelleux, parfaits pour l\'apéritif.', 'category' => 'apero', 'price' => 2.90],
    ];

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        foreach (self::PRODUCTS as $data) {
            $product = new Product();
            $product->setName($data['name']);
            $product->setDescription($data['description']);
            $product->setPrice($data['price']);
            $product->setImage(sprintf('https://picsum.photos/seed/%s/400/300', $data['category'].'-'.$faker->unique()->numberBetween(1, 9999)));
            $product->setAvailable($faker->boolean(85));

            $ratingsCount = $faker->numberBetween(0, 6);
            for ($i = 0; $i < $ratingsCount; ++$i) {
                $rating = new Rating();
                $rating->setScore($faker->numberBetween(1, 5));
                $product->addRating($rating);
                $manager->persist($rating);
            }
            $product->recomputeRating();

            $manager->persist($product);
        }

        $manager->flush();
    }
}
