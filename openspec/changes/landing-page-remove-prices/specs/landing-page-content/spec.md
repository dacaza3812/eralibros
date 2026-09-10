# Landing Page Content Specification

## Purpose

Controls what content is rendered on the landing page (`app/page.tsx`), specifically the Featured Books section.

## Requirements

### Requirement: Featured Books Price Visibility

The landing page Featured Books section SHALL NOT display book prices.

The system SHALL render book title and description for each featured book on the landing page.
The system SHALL NOT render a price element or price-related text within the Featured Books section.
The system SHALL continue displaying prices on all other pages (catalog, book detail).

#### Scenario: Prices hidden on landing page

- GIVEN a visitor loads the landing page
- WHEN the Featured Books section renders
- THEN each featured book displays title and description
- AND no price element is visible for any featured book

#### Scenario: Prices remain visible elsewhere

- GIVEN the catalog page or a book detail page is loaded
- WHEN book data renders
- THEN the price is displayed as before
- AND the landing page change has no effect on these pages

#### Scenario: Featured books with null price

- GIVEN a featured book has no price value (null/undefined)
- WHEN the landing page renders that book
- THEN the book displays title and description normally
- AND no placeholder or empty price element appears
