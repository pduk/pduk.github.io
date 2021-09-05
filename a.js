function start() {
	var request = new XMLHttpRequest();
	request.open("GET", "https://pduk.github.io/tests.json", true);
	request.onload = event => {
		if (request.readyState === 4) {
			if (request.status === 200) {
				answers = JSON.parse(request.responseText);
				check_if_correct();
				start_listening();
			} else {
				console.error(request.statusText);
			}
		}
	};
	request.onerror = event => {
		console.error(request.statusText);
	};
	request.send(null);
}

function start_listening() {
	var questionText = document.getElementById("question-text");
	observer = new MutationObserver(function (mutationsList, observer) {
		check_if_correct();
	});
	observer.observe(questionText, { characterData: false, childList: true, attributes: false });
}

function compare_array(firstArr, secondArr) {
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

function is_any_compare_array(firstArr, secondArr) {
	if (!Array.isArray(firstArr) || !Array.isArray(secondArr)) {
		return false;
	}

	return firstArr.some(x => secondArr.indexOf(x) !== -1);
}

function is_answer_correct(answer, correctAnswer) {
	if (answer.includes(correctAnswer) || correctAnswer.includes(answer)) {
		return true;
	}

	if (answer.includes("`")) {
		return is_answer_correct(answer.replace("`","'"), correctAnswer);
	}

	let answer1 = answer.trimRight('.');
	let correctAnswer1 = correctAnswer.trimRight('.');
	if (answer1.includes(correctAnswer1) || correctAnswer1.includes(answer1)) {
		return true;
	}

	return false;
}

function element_is_empty(element) {
	return Object.keys(element).length === 0 && element.constructor === Object;
}

function check_if_correct() {
	console.log("checking");
	var question = document.getElementById("question-text").innerText;
	question = question.trimRight('\n');
	var filteredAnswers = answers.filter(x => x.question === question);

	if (filteredAnswers.length === 0 && question.includes("`")) {
		question = question.replace("`", "'");
		filteredAnswers = answers.filter(x => x.question === question);
	}
	if (filteredAnswers.length === 0) {
		console.error(`cannot find answer for question: ${question}`);
		return;
	}

	var answer = {};
	if (filteredAnswers.length === 1) {
		answer = filteredAnswers[0];
	}
	else {
		var uiAnswers = [];
		document.querySelectorAll('.name-radio').forEach(x => {
			uiAnswers.push(x.innerText.trimRight('\n'));
		});
		uiAnswers = uiAnswers.filter(x => x);
		for (let i = 0; i < filteredAnswers.length; i++) {
			if (compare_array(uiAnswers, filteredAnswers[i].answers)) {
				answer = filteredAnswers[i];
				break;
			}
		}

		if (element_is_empty(answer)) {
			for (let i = 0; i < filteredAnswers.length; i++) {
				if (is_any_compare_array(uiAnswers, filteredAnswers[i].answers)) {
					answer = filteredAnswers[i];
					break;
				}
			}
		}
	}

	console.log(answer);

	var questionNum = document.getElementById("question-number");
	var correctAnswer = answer.answers[answer.rightAnswerIndex];
	document.querySelectorAll('.name-radio').forEach(item => {
		item.addEventListener('mouseover', event => {
			if (is_answer_correct(event.target.innerText, correctAnswer)) {
				questionNum.style.backgroundColor = "#a7c3b7";
			}
		});
		item.addEventListener('mouseout', event => {
			if (is_answer_correct(event.target.innerText, correctAnswer)) {
				questionNum.removeAttribute('style');
			}
		});
	});
}

var answers = [];
start();
