'use strict';

var usernamePage = document.querySelector('#username-page'); // Sélectionne la page d'identification
var chatPage = document.querySelector('#chat-page'); // Sélectionne la page de chat
var usernameForm = document.querySelector('#usernameForm'); // Sélectionne le formulaire d'identification
var messageForm = document.querySelector('#messageForm'); // Sélectionne le formulaire de message
var messageInput = document.querySelector('#message'); // Sélectionne le champ de saisie du message
var messageArea = document.querySelector('#messageArea'); // Sélectionne l'élément qui affiche les messages
var connectingElement = document.querySelector('.connecting'); // Sélectionne l'élément indiquant la connexion

var stompClient = null; // Client STOMP pour les communications WebSocket
var username = null; // Nom d'utilisateur

// Couleurs pour les avatars
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    // Récupère et nettoie le nom d'utilisateur saisi
    username = document.querySelector('#name').value.trim();

    if (username) {
        usernamePage.classList.add('hidden'); // Cache la page d'identification
        chatPage.classList.remove('hidden');  // Affiche la page de chat

        var socket = new SockJS('/ws'); // Crée une nouvelle connexion SockJS
        stompClient = Stomp.over(socket); // Utilise STOMP sur la connexion SockJS

        stompClient.connect({}, onConnected, onError); // Connecte le client STOMP avec des fonctions de rappel
    }
    event.preventDefault(); // Empêche le comportement par défaut du formulaire
}

function onConnected() {
    // S'abonne au sujet public
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Informe le serveur du nom d'utilisateur
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
    connectingElement.classList.add('hidden'); // Cache l'élément indiquant la connexion
}

function onError(error) {
    // Affiche un message d'erreur en cas d'échec de la connexion
    connectingElement.textContent = 'Impossible de se connecter au serveur WebSocket. Veuillez rafraîchir cette page et réessayer!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim(); // Récupère et nettoie le contenu du message

    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        // Envoie le message au serveur
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = ''; // Réinitialise le champ de saisie
    }
    event.preventDefault(); // Empêche le comportement par défaut du formulaire
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body); // Convertit le message reçu en objet JSON
    var messageElement = document.createElement('li'); // Crée un nouvel élément de liste pour le message

    if (message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' a rejoint!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' a quitté!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i'); // Crée un élément pour l'avatar
        var avatarText = document.createTextNode(message.sender[0]); // Utilise la première lettre du nom d'utilisateur comme avatar
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender); // Assigne une couleur à l'avatar

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span'); // Crée un élément pour le nom d'utilisateur
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);

        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p'); // Crée un élément pour le contenu du message
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement); // Ajoute le message à la zone de messages
    messageArea.scrollTop = messageArea.scrollHeight; // Fait défiler la zone de messages jusqu'en bas
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i); // Calcule un hash pour le nom d'utilisateur
    }
    var index = Math.abs(hash % colors.length); // Utilise le hash pour choisir une couleur
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true); // Ajoute un écouteur d'événement pour le formulaire d'identification
messageForm.addEventListener('submit', sendMessage, true); // Ajoute un écouteur d'événement pour le formulaire de message
