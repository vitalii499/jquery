$(document).ready(function(){
    var booksPerPage = 5; // pagination count
    var currentPage = 1; 

    $('.close').click(function() {
        $('#bookModal').hide();
    });
    // load/dropdown for categories
    function loadCategories() {
        $.ajax({
            url: 'https://api.nytimes.com/svc/books/v3/lists/names.json',
            method: 'GET',
            data: {
                'api-key': 'fdKBo9PjvGduveU5j4AP5Se29OgiQ02u'
            },
            success: function(response) {
                $('#category').empty();
                // Добавляем категории в выпадающий список
                response.results.forEach(function(category) {
                    $('#category').append($('<option>', {
                        value: category.list_name_encoded,
                        text: category.display_name
                    }));
                });
            },
            error: function(error) {
                console.error('Ошибка при загрузке категорий:', error);
            }
        });
    }

    // load categories on page mount
    loadCategories();

    // Add calendary
    $('#datepicker').datepicker({
        maxDate: 0
    });

    // For category and data picker
    $('#category, #datepicker').change(function() {
        loadBooks();
    });

    function loadBooks() {
        var category = $('#category').val();
        var date = $('#datepicker').val();
        let parts = date.split('/');
        let modifiedString = parts[2] + '-' + parts[0] + '-' + parts[1];

        $.ajax({
            url: 'https://api.nytimes.com/svc/books/v3/lists/' + modifiedString + '/' + category + '.json',
            method: 'GET',
            data: {
                'api-key': 'fdKBo9PjvGduveU5j4AP5Se29OgiQ02u'
            },
            success: function(response) {
                $('#booksList').empty();
                response.results.books.forEach(function(book, index) {
                    if (index >= (currentPage - 1) * booksPerPage && index < currentPage * booksPerPage) {
                        var buyLinksJSON = JSON.stringify(book.buy_links).replace(/'/g, "\\'");
                        var buyIBNS = JSON.stringify(book.isbns).replace(/'/g, "\\'");
                        console.log(buyLinksJSON, )
                
                var bookHTML = '<div class="book card book-card" data-isbns=\'' + buyIBNS + '\' data-title="' + book.title + '" data-author="' + book.author + '" data-publisher="' + book.publisher + '" data-buy-links=\'' + buyLinksJSON + '\'>' +
                '<img class="card-img-top" src="' + book.book_image + '" alt="' + book.title + '">' +
                '<div class="card-body">' +
                '<h5 class="card-title">' + book.title + '</h5>' +
                '<p class="card-text">Author: ' + book.author + '</p>' +
                '</div>';
                $('#booksList').append(bookHTML);
                    }
                });
                // Show pagination
                showPagination(response.results.books.length);
            },
            error: function(error) {
                console.error('Ошибка при загрузке списка книг:', error);
            }
        });
    }
// pagination
    function showPagination(totalBooks) {
        var totalPages = Math.ceil(totalBooks / booksPerPage);
        var paginationHTML = '<ul class="pagination">';
        for (var i = 1; i <= totalPages; i++) {
            paginationHTML += '<li class="page-item' + (i === currentPage ? ' active' : '') + '"><a class="page-link" href="#">' + i + '</a></li>';
        }
        paginationHTML += '</ul>';
        $('#pagination').html(paginationHTML);

        // Обработчик события нажатия на номер страницы
        $('.pagination .page-link').click(function(e) {
            e.preventDefault();
            currentPage = parseInt($(this).text());
            loadBooks();
        });
    }
// List of book reviews     
    function loadReviews(bookISBN) {
        $.ajax({
            url: 'https://api.nytimes.com/svc/books/v3/reviews.json',
            method: 'GET',
            data: {
                'isbn': bookISBN,
                'api-key': 'fdKBo9PjvGduveU5j4AP5Se29OgiQ02u'
            },
            success: function(response) {
                console.log(response)
                var reviewsHTML = '<h3>Book Reviews</h3>';
                if (response.results.length > 0) {
                    response.results.forEach(function(review) {
                        reviewsHTML += '<p><strong>' + review.publication_dt + '</strong>: ' + review.summary + '</p>';
                    });
                } else {
                    reviewsHTML += '<p>No reviews found.</p>';
                }
                $('#bookReviews').html(reviewsHTML);
            },
            error: function(error) {
                console.error('Error loading book reviews:', error);
                $('#bookReviews').html('<p>Error loading reviews.</p>');
            }
        });
    }

// Modal window
    $(document).on('click', '.book', function() {
        var title = $(this).data('title');
        var author = $(this).data('author');
        var publisher = $(this).data('publisher');
        var buyLinks = $(this).data('buyLinks');
        var isbns = $(this).data('isbns'); // Массив объектов с ISBN-10 и ISBN-13
        console.log(isbns)
    // Выбираем ISBN-13 из массива ISBN
    var bookISBN = '';
    for (var i = 0; i < isbns.length; i++) {
        if (isbns[i].isbn13) {
            bookISBN = isbns[i].isbn13;
            break;
        }
    }
    console.log(bookISBN)
        var modalContent = '<p>Title: ' + title + '</p>' +
                   '<p>Author: ' + author + '</p>' +
                   '<p>Publisher: ' + publisher + '</p>';
        if (buyLinks && buyLinks.length > 0) {
    modalContent += '<p>Buy Links:</p><ul>';
    buyLinks.forEach(function(link) {
        modalContent += '<li><a href="' + link.url + '">' + link.name + '</a></li>';
    });
    modalContent += '</ul>';
        }

        $('#bookDetails').html(modalContent);
        $('#bookModal').show();
    });
    if(bookISBN) {
        loadReviews(bookISBN);
    }
});

                