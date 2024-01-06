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
            if(!messageText) {
                messageText = '';
            }
            if (message.filename) {
                messageText += '</div><div class="message-footer">' +
                `<a href="/files/download/${message.id}" target="_blank">` +
                '<img class="download-icon" src="/icons/download.svg" /> ' +
                `${message.filename}</a>`;
            }
            chatHistory.append(`<div class="message">`+
                `<div class="message-header d-flex justify-content-between">`+
                `<img class="delete-button" data-id="${message.id}" src="/icons/x-square.svg" />`+
                `<span class="username">${message.username} &nbsp;&nbsp; ${formattedDate}</span>`+
                `<img class="copy-button" data-id="${message.id}" src="/icons/clipboard.svg" alt="Copy to clipboard" />`+
                `</div>`+
                `<div class="message-text" id="messageDiv${message.id}">${messageText}</div>`+
                `</div>`);
        });

        $('.copy-button').click(function () {
            const messageId = $(this).data('id');
            const messageDiv = $('#messageDiv' + messageId);

            const range = document.createRange();
            range.selectNode(messageDiv[0]);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand("copy");
            window.getSelection().removeAllRanges();

            const originalSrc = $(this).attr('src');
            $(this).attr('src', '/icons/clipboard-check.svg');

            setTimeout(() => {
                $(this).attr('src', originalSrc);
            }, 2000);
        });
        
        $('.delete-button').click(function () {
            const messageId = $(this).data('id');
            if (confirm('Sure?')) {
                $.ajax({
                    url: '/messages/' + messageId,
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
                url: '/files/upload',
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
                url: '/messages',
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

    $.get('/messages', function (response) {
        renderMessages(response);
    }).fail(function () {
        alert('Error getting chat history');
    });
});        