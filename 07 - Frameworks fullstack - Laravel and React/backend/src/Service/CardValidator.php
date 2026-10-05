<?php

namespace App\Service;

class CardValidator
{
    /**
     * @return string[] Liste des erreurs de validation. Vide si la carte est valide.
     */
    public function validate(string $cardNumber, string $expiryMonth, string $expiryYear, string $cvv): array
    {
        $errors = [];
        $digitsOnly = preg_replace('/\D/', '', $cardNumber);

        if (strlen($digitsOnly) < 13 || strlen($digitsOnly) > 19) {
            $errors[] = 'Le numéro de carte doit contenir entre 13 et 19 chiffres.';
        } elseif (!$this->passesLuhnCheck($digitsOnly)) {
            $errors[] = 'Le numéro de carte est invalide.';
        }

        $month = (int) $expiryMonth;
        $year = (int) $expiryYear;

        if ($month < 1 || $month > 12) {
            $errors[] = 'Le mois d\'expiration est invalide.';
        } else {
            $expiry = \DateTimeImmutable::createFromFormat('Y-n-d', sprintf('%d-%d-1', $year, $month))
                ?->modify('last day of this month 23:59:59');

            if (!$expiry || $expiry < new \DateTimeImmutable()) {
                $errors[] = 'La carte a expiré.';
            }
        }

        if (!preg_match('/^\d{3,4}$/', $cvv)) {
            $errors[] = 'Le code de sécurité (CVV) est invalide.';
        }

        return $errors;
    }

    private function passesLuhnCheck(string $digitsOnly): bool
    {
        $sum = 0;
        $alternate = false;

        for ($i = strlen($digitsOnly) - 1; $i >= 0; --$i) {
            $digit = (int) $digitsOnly[$i];

            if ($alternate) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
            $alternate = !$alternate;
        }

        return 0 === $sum % 10;
    }
}
