<?php

namespace App\DataFixtures;

use App\Entity\Product;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ProductFixtures extends Fixture
{
    private const PRODUCTS = [
        ['name' => 'Quiche lorraine', 'category' => 'Plats cuisinés', 'price' => 450, 'desc' => 'Pâte brisée, lardons, crème et emmental.', 'stock' => 25, 'image' => '/img/quiche.jpeg'],
        ['name' => 'Lasagnes bolognaise', 'category' => 'Plats cuisinés', 'price' => 590, 'desc' => 'Sauce bolognaise mijotée et béchamel maison.', 'stock' => 20, 'image' => '/img/lasagne.jpeg'],
        ['name' => 'Poulet basquaise', 'category' => 'Plats cuisinés', 'price' => 620, 'desc' => 'Filet de poulet, poivrons et tomates.', 'stock' => 18, 'image' => '/img/basquaise.jpeg'],
        ['name' => 'Gratin dauphinois', 'category' => 'Plats cuisinés', 'price' => 480, 'desc' => 'Pommes de terre, crème fraîche et muscade.', 'stock' => 22, 'image' => '/img/gratin.avif'],
        ['name' => 'Riz cantonais', 'category' => 'Plats cuisinés', 'price' => 410, 'desc' => 'Riz sauté, petits légumes, œuf et jambon.', 'stock' => 30, 'image' => '/img/riz-cantonaise.jpeg'],
        ['name' => 'Frites croustillantes', 'category' => 'Légumes', 'price' => 320, 'desc' => 'Pommes de terre sélectionnées, cuisson au four.', 'stock' => 40, 'image' => '/img/frite.jpeg'],
        ['name' => 'Haricots verts extra-fins', 'category' => 'Légumes', 'price' => 290, 'desc' => 'Récoltés et surgelés au pic de fraîcheur.', 'stock' => 35, 'image' => '/img/haricots-vert.jpeg'],
        ['name' => 'Poêlée de légumes du soleil', 'category' => 'Légumes', 'price' => 350, 'desc' => 'Courgettes, poivrons, tomates et oignons.', 'stock' => 28, 'image' => '/img/legumes.jpeg'],
        ['name' => 'Épinards hachés', 'category' => 'Légumes', 'price' => 280, 'desc' => 'Épinards en branches hachés, sans additif.', 'stock' => 26, 'image' => '/img/epinards.jpeg'],
        ['name' => 'Filet de saumon', 'category' => 'Poissons', 'price' => 790, 'desc' => 'Filet de saumon sans peau ni arêtes.', 'stock' => 15, 'image' => '/img/saumon.jpeg'],
        ['name' => 'Nuggets de poulet', 'category' => 'Viandes & Poissons', 'price' => 490, 'desc' => 'Filet de poulet pané, croustillant.', 'stock' => 32, 'image' => '/img/nuggets.jpeg'],
        ['name' => 'Cordon bleu', 'category' => 'Viandes & Poissons', 'price' => 520, 'desc' => 'Blanc de poulet, jambon et emmental.', 'stock' => 24, 'image' => '/img/cordon-bleu.jpeg'],
        ['name' => 'Steak haché pur bœuf', 'category' => 'Viandes & Poissons', 'price' => 610, 'desc' => 'Viande bovine française, 15% MG.', 'stock' => 20, 'image' => '/img/steak.avif'],
        ['name' => 'Tarte aux pommes', 'category' => 'Desserts', 'price' => 420, 'desc' => 'Pâte sablée et pommes fondantes.', 'stock' => 18, 'image' => '/img/tarte-pomme.avif'],
        ['name' => 'Moelleux au chocolat', 'category' => 'Desserts', 'price' => 380, 'desc' => 'Cœur coulant au chocolat noir.', 'stock' => 26, 'image' => '/img/choco-moelleux.jpeg'],
        ['name' => 'Fondant citron', 'category' => 'Desserts', 'price' => 390, 'desc' => 'Gâteau moelleux au citron.', 'stock' => 20, 'image' => '/img/citron-dessert.avif'],
        ['name' => 'Glace vanille', 'category' => 'Desserts', 'price' => 550, 'desc' => 'Crème glacée à la vanille de Madagascar.', 'stock' => 15, 'image' => '/img/vanille-glace.avif'],
        ['name' => 'Mini feuilletés apéritif', 'category' => 'Apéritif', 'price' => 460, 'desc' => 'Assortiment de feuilletés salés.', 'stock' => 22, 'image' => '/img/feuillete.avif'],
        ['name' => 'Samoussas légumes', 'category' => 'Apéritif', 'price' => 430, 'desc' => 'Feuille de brick croustillante, légumes épicés.', 'stock' => 20, 'image' => '/img/samossas.avif'],
        ['name' => 'Bouchées apéritives fromage', 'category' => 'Apéritif', 'price' => 410, 'desc' => 'Pâte feuilletée et cœur fondant au fromage.', 'stock' => 24, 'image' => '/img/fromage-bouche.avif'],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach (self::PRODUCTS as $data) {
            $product = new Product();
            $product->setName($data['name']);
            $product->setDescription($data['desc']);
            $product->setCategory($data['category']);
            $product->setPriceCents($data['price']);
            $product->setStock($data['stock']);
            $product->setImageUrl($data['image'] ?? $this->placeholderImage($data['name']));
            $product->setIsAvailable(true);

            $manager->persist($product);
        }

        $manager->flush();
    }

    private function placeholderImage(string $name): string
    {
        return 'https://placehold.co/400x300/1e40af/ffffff?text=' . rawurlencode($name);
    }
}
