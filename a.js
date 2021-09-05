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

function is_answer_correct(answer, correctAnswer)
{
	return answer.includes(correctAnswer)
}

function check_if_correct() {
	console.log("Checking");
	var question = document.getElementById("question-text").innerText;
	question = question.trimRight('\n');
	var filteredAnswers = answers.filter(x => x.question === question);

	if (filteredAnswers === undefined || filteredAnswers === null || filteredAnswers.length === 0) {
		console.error("Cannot find answer");
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