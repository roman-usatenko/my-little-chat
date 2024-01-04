$(document).ready(function () {
    const chatHistory = $('#chat-history');
    const messageInput = $('#message-input');
    const sendButton = $('#send-button');
    const setUsernameButton = $('#set-username-button');

    sendButton.on('click', function () {
        sendUserMessage();
    });

    setUsernameButton.on('click', function () {
        setUsername();
    });

    messageInput.on('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            sendUserMessage();
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
            chatHistory.append(`<div class="message"><div class="message-header"><span class="username">${message.username}</span> <span class="timestamp">${formattedDate}</span></div><pre class="message-text">${message.message}</pre></div>`);
        });
        chatHistory.scrollTop(chatHistory[0].scrollHeight);
    }

    function sendUserMessage() {
        const message = messageInput.val().trim();
        if (message) {
            $.ajax({
                url: '/chat',
                type: 'POST',
                data: message,
                contentType: 'text/plain; charset=utf-8',
                success: function (response) {
                    messageInput.val('');
                    renderMessages(response);
                }, error: function () {
                    alert('Error sending message');
                }
            });
        }
    }

    initUsernameButton();
    $.get('/chat', function (response) {
        renderMessages(response);
    }).fail(function () {
        alert('Error getting chat history');
    });
});        