const axios = require('axios');

// 1. Розрахунок штрафу за прострочення повернення книги (5 грн/день)
function calculateLateFee(daysOverdue) {
    if (daysOverdue <= 0) return 0;
    return daysOverdue * 5;
}

// 2. Перевірка валідності інвентарного ID книги (формат: B001, M002, D003)
function isValidItemId(id) {
    return typeof id === 'string' && /^[BMD]\d{3}$/.test(id);
}

// 3. Пошук книг за назвою або автором без урахування регістру
function filterBooksByQuery(books, query) {
    if (!query) return books;
    const q = query.toLowerCase().trim();
    return books.filter(
        b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
}

// 4. Інтеграційна функція 1: оформлення оренди книги (поєднує валідацію ID, перевірку статусу та розрахунок вартості)
function processBookRental(book, days) {
    if (!isValidItemId(book.id)) {
        throw new Error('Некоректний ID елемента');
    }
    if (!book.available) {
        return { success: false, message: 'Книга вже орендована' };
    }
    book.available = false;
    const price = days * 10;
    return { success: true, bookTitle: book.title, totalPrice: price };
}

// 5. Інтеграційна функція 2: завантаження каталогу книг із зовнішнього API
async function fetchRemoteCatalog() {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=3');
    return response.data.map(item => ({
        id: `B00${item.id}`,
        title: item.title,
        available: true
    }));
}

module.exports = {
    calculateLateFee,
    isValidItemId,
    filterBooksByQuery,
    processBookRental,
    fetchRemoteCatalog
};