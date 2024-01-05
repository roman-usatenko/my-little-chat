$(document).ready(function () {
    const chatHistory = $('#chat-history');
    const messageInput = $('#message-input');
    const sendButton = $('#send-button');
    const setUsernameButton = $('#set-username-button');
    const fileInput = $('#file-input');
    const appVersion = $('#app-version');

    sendButton.on('click', function () {
        sendMessage();
    });

    setUsernameButton.on('click', function () {
        setUsername();
    });

    messageInput.on('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    function initUsernameButton() {
        var username = Cookies.get('username');
        if (!username) {
            username = "Anonymous";
            Cookies.set('username', username, { expires: Infinity });
        }
        setUsernameButton.text(username);
    }

    function setUsername() {
        var username = prompt("Please enter your username", setUsernameButton.text());
        if (username) {
            //todo: sanitize username
            Cookies.set('username', username, { expires: Infinity });
            initUsernameButton();
        }
    }

    function renderMessages(messages) {
        chatHistory.empty();
        messages.forEach(function (message) {
            const date = new Date(message.timestamp);
            const formattedDate = date.toLocaleString();
            var messageText = message.message;
            if (message.filename) {
                if(messageText) {
                    messageText += '<br>';
                } else {
                    messageText = '';
                }
                messageText += `<a href="/download/${message.id}" target="_blank">${message.filename}</a>`;
            }
            chatHistory.append(`<div class="message"><div class="message-header"><span class="username">${message.username} &nbsp;&nbsp; ${formattedDate}</span>&nbsp;&nbsp;<button class="delete-button btn btn-link btn-sm" data-id="${message.id}">&#215;</button></div><div class="message-text">${messageText}</div></div>`);
        });
        
        $('.delete-button').click(function () {
            const messageId = $(this).data('id');
            if (confirm('Sure?')) {
                $.ajax({
                    url: '/chat/' + messageId,
                    type: 'DELETE',
                    success: function (response) {
                        renderMessages(response);
                    },
                    error: function () {
                        alert('Error deleting message');
                    }
                });
            }
        });
    }

    function sendMessage() {
        var message = $('#message-input').html().trim();
        var file = fileInput.prop('files')[0];
        if (file) {
            var formData = new FormData();
            var blob = new Blob([file], {type: file.type});
            formData.append('message', encodeURIComponent(message));
            formData.append('file', blob, encodeURIComponent(file.name));
            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    fileInput.val(''); 
                    renderMessages(response);
                },
                error: function() {
                    alert('Error uploading file');
                }
            });
        } else if (message) {
            $.ajax({
                url: '/chat',
                type: 'POST',
                data: message,
                contentType: 'text/html; charset=utf-8',
                success: function (response) {
                    messageInput.html('');
                    renderMessages(response);
                }, error: function () {
                    alert('Error sending message');
                }
            });
        }
    }

    initUsernameButton();

    $.get('/version', function (response) {
        appVersion.text("v." +response);
    }).fail(function () {
        appVersion.text('v.err');
    });

    $.get('/chat', function (response) {
        renderMessages(response);
    }).fail(function () {
        alert('Error getting chat history');
    });
});        