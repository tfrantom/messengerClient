/**
 * Loads Boards and posts messages
 *
 * @author 
 * Tyler Frantom
 */

BoardService = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection('messages');
		this._unsubscribe = null;
	}

	getBoard(boardId, boardConsumer) {
		this._ref.where('board', '==', boardId)
		.orderBy('timeSent', 'asc')
		.get()
		.then((querySnapshot) => {
				let messages = [];
				querySnapshot.forEach((doc) => {
					messages.push(new Message(
						doc.data().sender,
						doc.data().board,
						doc.data().message,
						doc.data().timeSent
					))
				});
				boardConsumer(messages);
			});
	}

	post(message, sender, board) {
		if(message) {
			this._ref.add({
				'sender': sender,
				'board': board,
				'message': message,
				'timeSent': firebase.firestore.Timestamp.now()
			})
			.then((docRef) => {
				console.log('Message made with Id: ', docRef.id);
			})
			.catch((error) => {
				console.log('Error: ', error);
			});
		}
	} 
}

Message = class {
	constructor(sender, boardId, message, timeSent) {
		this.sender = sender;
		this.boardId = boardId;
		this.message = message;
		this.timeSent = timeSent;
	}
}

handle = 'anonymous';
boardId = null;

LandingPageController = class {
	boardService = new BoardService();

	constructor() {
		this.boardService = new BoardService();
		document.querySelector('#joinButton').onclick = (event) => {
			this.join();
		}
		document.querySelector('#sendButton').onclick = (event) => {
			if(boardId) {
				this.boardService.post(document.querySelector('#inputMessage').value,
					handle,
					boardId
				);
				this.refreshBoard();
			}
		}
	}

	join() {
		handle = document.querySelector('#inputHandle').value;
		boardId = document.querySelector('#inputBoard').value.toLowerCase();
		this.refreshBoard();
		let refreshInterval = setInterval(() => {
			this.refreshBoard();
		}, 3000)
	}
	
	refreshBoard() {
		this.boardService.getBoard(boardId, this.drawBoard);
	}

	drawBoard(messages) {
		const newList = htmlToElement('<div id="messageContainer" class ="scroll"></div>'); 
		messages.forEach(m => {
			const card = createCard(m);
			newList.appendChild(card);
		});
		const oldList = document.querySelector('#messageContainer');
		oldList.removeAttribute('id');
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

	
}

function createCard(message) {
	const dateTime = message.timeSent.toDate();
	if(message.sender == handle) {
		return htmlToElement(`<div class="row justify-content-end">
		<div class="col-4 card text-white bg-dark mt-1 justify-content-right">
		<div class="card-body">
		<h4 class="card-title">${message.message}</h4>
		<div class="text-white">${message.sender} sent at ${dateTime.toLocaleTimeString()} on ${dateTime.toDateString()}.</div>
		</div></div></div>`);
	} else {
		return htmlToElement(`<div class="row justify-content-start">
		<div class="col-4 card text-white bg-primary mt-1 justify-content-left">
		<div class="card-body">
		<h4 class="card-title">${message.message}</h4>
		<div class="text-white">${message.sender} sent at ${dateTime.toLocaleTimeString()} on ${dateTime.toDateString()}.</div>
		</div></div></div>`);
	}
}
function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


/* Main */
main = function () {
	new LandingPageController();
};

main();
