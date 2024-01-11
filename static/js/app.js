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
                '<i class="fas fa-download"></i> ' +
                `${message.filename}</a>`;
            }
            chatHistory.append(`<div class="message">`+
                `<div class="message-header d-flex justify-content-between">`+
                `<i class="far fa-trash-alt delete-button" data-id="${message.id}" title="Delete record"></i>`+
                `<span class="username">${message.username} &nbsp;&nbsp; ${formattedDate}</span>`+
                `<i class="far fa-clipboard copy-button" data-id="${message.id}" title="Copy to clipboard"></i>`+
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

            $(this).attr('class', 'fas fa-clipboard-check copy-button');
            setTimeout(() => {
                $(this).attr('class', 'far fa-clipboard copy-button');
            }, 1000);
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

    function spinSendButton(doSpin) {
        if (doSpin) {
            sendButton.prop('disabled', true);
            sendButton.html('<i class="fas fa-spinner fa-spin"></i>');
        } else {
            sendButton.html('Send');
            sendButton.prop('disabled', false);
        }
    }

    function sendMessage() {
        var message = $('#message-input').html().trim();
        var file = fileInput.prop('files')[0];
        if (file) {
            var formData = new FormData();
            var blob = new Blob([file], {type: file.type});
            formData.append('message', encodeURIComponent(message));
            formData.append('file', blob, encodeURIComponent(file.name));
            spinSendButton(true);
            $.ajax({
                url: '/files/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    fileInput.val(''); 
                    renderMessages(response);
                    spinSendButton(false);
                },
                error: function() {
                    alert('Error uploading file');
                    spinSendButton(false);
                }
            });
        } else if (message) {
            spinSendButton(true);
            $.ajax({
                url: '/messages',
                type: 'POST',
                data: message,
                contentType: 'text/html; charset=utf-8',
                success: function (response) {
                    messageInput.html('');
                    renderMessages(response);
                    spinSendButton(false);
                }, error: function () {
                    alert('Error sending message');
                    spinSendButton(false);
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