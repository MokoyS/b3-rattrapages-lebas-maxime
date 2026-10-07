<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260930100755 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cart (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, status VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL)');
        $this->addSql('CREATE TABLE cart_item (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, quantity INTEGER NOT NULL, cart_id INTEGER NOT NULL, product_id INTEGER NOT NULL, CONSTRAINT FK_F0FE25271AD5CDBF FOREIGN KEY (cart_id) REFERENCES cart (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_F0FE25274584665A FOREIGN KEY (product_id) REFERENCES product (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_F0FE25271AD5CDBF ON cart_item (cart_id)');
        $this->addSql('CREATE INDEX IDX_F0FE25274584665A ON cart_item (product_id)');
        $this->addSql('CREATE TABLE product (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(150) NOT NULL, image VARCHAR(500) NOT NULL, description CLOB NOT NULL, price DOUBLE PRECISION NOT NULL, rating DOUBLE PRECISION DEFAULT NULL, available BOOLEAN NOT NULL)');
        $this->addSql('CREATE TABLE rating (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, score INTEGER NOT NULL, created_at DATETIME NOT NULL, product_id INTEGER NOT NULL, CONSTRAINT FK_D88926224584665A FOREIGN KEY (product_id) REFERENCES product (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_D88926224584665A ON rating (product_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE cart');
        $this->addSql('DROP TABLE cart_item');
        $this->addSql('DROP TABLE product');
        $this->addSql('DROP TABLE rating');
    }
}
