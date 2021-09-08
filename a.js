function start() {
	var request = new XMLHttpRequest();
	request.open("GET", "https://pduk.github.io/tests.json", true);
	request.onload = () => {
		if (request.readyState === 4) {
			if (request.status === 200) {
				answers = JSON.parse(request.responseText);
				findCorrectAnswer();
				onQuestionChanged();
			} else {
				console.error(request.statusText);
			}
		}
	};
	request.onerror = () => {
		console.error(request.statusText);
	};
	request.send(null);
}

function onQuestionChanged() {
	var questionText = document.getElementById("question-text");
	observer = new MutationObserver(function (mutationsList, observer) {
		findCorrectAnswer();
	});
	observer.observe(questionText, { characterData: false, childList: true, attributes: false });
}

function compareArray(firstArr, secondArr) {
	if (!Array.isArray(firstArr) || !Array.isArray(secondArr)
		|| firstArr.length !== secondArr.length) {
		return false;
	}

	const arr1 = firstArr.concat().sort();
	const arr2 = secondArr.concat().sort();

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}

function compareAnyArrayElement(firstArr, secondArr) {
	if (!Array.isArray(firstArr) || !Array.isArray(secondArr)) {
		return false;
	}

	return firstArr.some(x => secondArr.indexOf(x) !== -1);
}

function isAnswerCorrect(answer, correctAnswer) {
	if (answer.includes(correctAnswer) || correctAnswer.includes(answer)) {
		return true;
	}

	if (answer.includes("`")) {
		return isAnswerCorrect(answer.replace("`", "'"), correctAnswer);
	}

	let answer1 = answer.trimRight('.');
	let correctAnswer1 = correctAnswer.trimRight('.');
	if (answer1.includes(correctAnswer1) || correctAnswer1.includes(answer1)) {
		return true;
	}

	return false;
}

function isElementEmpty(element) {
	return Object.keys(element).length === 0 && element.constructor === Object;
}

function markItemAsCorrect(item) {
	var questionNum = document.getElementById("question-number");
	item.addEventListener('mouseover', () => {
		questionNum.style.backgroundColor = "#A7B9C3";
	});
	item.addEventListener('mouseout', () => {
		questionNum.removeAttribute('style');
	});
}

function levenshteinDistance(first, second) {
	const track = Array(second.length + 1).fill(null).map(() =>
		Array(first.length + 1).fill(null));
	for (let i = 0; i <= first.length; i += 1) {
		track[0][i] = i;
	}
	for (let j = 0; j <= second.length; j += 1) {
		track[j][0] = j;
	}
	for (let j = 1; j <= second.length; j += 1) {
		for (let i = 1; i <= first.length; i += 1) {
			const indicator = first[i - 1] === second[j - 1] ? 0 : 1;
			track[j][i] = Math.min(
				track[j][i - 1] + 1,
				track[j - 1][i] + 1,
				track[j - 1][i - 1] + indicator,
			);
		}
	}
	return track[second.length][first.length];
};

function findAnswerLevenshteinDistance(question) {
	var minDistance = 100;
	var answer = {};
	for (let i = 0; i < answers.length; ++i) {
		let answr = answers[i];
		let distance = levenshteinDistance(question, answr.question);
		if (distance < minDistance) {
			minDistance = distance;
			answer = answr;
		}
	}
	console.log(`question levenshtein distance=${minDistance}`);

	return !isElementEmpty(answer) ? answer : null;
}

function findAnswer(question) {
	var filteredAnswers = answers.filter(x => x.question === question);

	if (filteredAnswers.length === 0 && question.includes("`")) {
		question = question.replace("`", "'");
		filteredAnswers = answers.filter(x => x.question === question);
	}

	if (filteredAnswers.length === 0) {
		return findAnswerLevenshteinDistance(question);
	}

	if (filteredAnswers.length === 1) {
		return filteredAnswers[0];
	}
	else {
		var uiAnswers = [];
		document.querySelectorAll('.name-radio').forEach(x => {
			uiAnswers.push(x.innerText.trimRight('\n'));
		});
		uiAnswers = uiAnswers.filter(x => x);
		//Check if all answers coresponds
		for (let i = 0; i < filteredAnswers.length; i++) {
			if (compareArray(uiAnswers, filteredAnswers[i].answers)) {
				return filteredAnswers[i];
			}
		}

		//Otherwise check if any answer present
		for (let i = 0; i < filteredAnswers.length; i++) {
			if (compareAnyArrayElement(uiAnswers, filteredAnswers[i].answers)) {
				return filteredAnswers[i];
			}
		}
	}

	return answer;
}

function findCorrectAnswer() {
	console.log("checking...");
	var question = document.getElementById("question-text").innerText;
	var answer = findAnswer(question.trimRight('\n'));

	if (answer === null || isElementEmpty(answer)) {
		console.log(`cannot find answer for question: ${question}`);
		return;
	}

	console.log(answer);
	var correctAnswer = answer.answers[answer.rightAnswerIndex];
	var uiAnswers = document.querySelectorAll('.name-radio');
	for (let i = 0; i < uiAnswers.length; ++i) {
		let item = uiAnswers[i];
		if (isAnswerCorrect(item.innerText, correctAnswer)) {
			markItemAsCorrect(item);
			return;
		}
	}

	//Find answer using Levinshtein distance
	var minDistance = 50;
	var minDistanceItem = {};
	uiAnswers.forEach(item => {
		var distance = levenshteinDistance(correctAnswer, item.innerText);
		if (distance < minDistance) {
			minDistance = distance;
			minDistanceItem = item;
		}
	});

	console.log(`answer levishtein distance=${minDistance}`);
	if (!isElementEmpty(minDistanceItem)) {
		markItemAsCorrect(minDistanceItem);
	}
}

var answers = [];
start();
