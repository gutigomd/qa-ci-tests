const axios = require('axios');
const {
    calculateLateFee,
    isValidItemId,
    filterBooksByQuery,
    processBookRental,
    fetchRemoteCatalog
} = require('../src/library');

jest.mock('axios');

describe('Модульні (Unit) тести для Library', () => {
    // Unit-тест 1
    test('Unit 1: Розрахунок штрафу за прострочення повернення', () => {
        expect(calculateLateFee(0)).toBe(0);
        expect(calculateLateFee(-3)).toBe(0);
        expect(calculateLateFee(4)).toBe(20);
    });

    // Unit-тест 2
    test('Unit 2: Валідація формату інвентарного ID', () => {
        expect(isValidItemId('B001')).toBe(true);
        expect(isValidItemId('D015')).toBe(true);
        expect(isValidItemId('X999')).toBe(false);
        expect(isValidItemId('B12')).toBe(false);
    });

    // Unit-тест 3
    test('Unit 3: Фільтрація книг за пошуковим запитом', () => {
        const books = [
            { id: 'B001', title: '1984', author: 'Джордж Орвелл' },
            { id: 'B002', title: 'Матриця', author: 'Вачовскі' }
        ];
        expect(filterBooksByQuery(books, 'орвелл')).toHaveLength(1);
        expect(filterBooksByQuery(books, 'орвелл')[0].id).toBe('B001');
        expect(filterBooksByQuery(books, 'неіснуюча')).toHaveLength(0);
    });
});

describe('Інтеграційні (Integration) тести для Library', () => {
    // Integration-тест 1 (взаємодія кількох модулів/функцій)
    test('Integration 1: Оформлення оренди книги (валідація + зміна стану + розрахунок ціни)', () => {
        const book = { id: 'B001', title: '1984', available: true };

        const firstRent = processBookRental(book, 5);
        expect(firstRent).toEqual({
            success: true,
            bookTitle: '1984',
            totalPrice: 50
        });
        expect(book.available).toBe(false);

        // Повторна спроба орендувати вже зайняту книгу
        const secondRent = processBookRental(book, 3);
        expect(secondRent.success).toBe(false);
    });

    // Integration-тест 2 (взаємодія із зовнішнім API через mock)
    test('Integration 2: Завантаження та мапінг каталогу книг із зовнішнього API', async () => {
        axios.get.mockResolvedValue({
            data: [
                { id: 1, title: 'Кобзар' },
                { id: 2, title: 'Тіні забутих предків' }
            ]
        });

        const catalog = await fetchRemoteCatalog();
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(catalog).toHaveLength(2);
        expect(catalog[0]).toEqual({
            id: 'B001',
            title: 'Кобзар',
            available: true
        });
    });
});