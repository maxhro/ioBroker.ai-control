const axios = require('axios');

const requestState = {
	Unknown: 'unknown',
	Disabled: 'disabled',
	Initialized: 'initialized',
	Setup: 'setup',
	Start: 'start',
	Success: 'success',
	Error: 'error',
};

function apiTest(adapter) {
	return getModels(adapter).then((result) => {
		if (!result) {
			return false;
		}
		return true;
	});
}

function getModels(adapter) {
	adapter.setState('openai.requeststate', requestState.Initialized, true);
	adapter.setState('openai.requeststate', requestState.Setup, true);

	const modelsUrl = 'https://api.openai.com/v1/models';

	const client = axios.create({
		headers: { Authorization: 'Bearer ' + adapter.config.openai_apikey },
	});

	adapter.setState('openai.requeststate', requestState.Start, true);

	return client
		.get(modelsUrl)
		.then((response) => {
			response.data.data.forEach((model) => {
				adapter.log.debug(
					`Got model '${model.id}' from ${new Date(model.created * 1000).toLocaleDateString()} by organization '${model.owned_by}'.`,
				);
			});
			//adapter.log.debug(JSON.stringify(response.data));
			adapter.setState('openai.requeststate', requestState.Success, true);
			return response.data;
		})
		.catch((err) => {
			adapter.log.error('Axios err: ', err);
			adapter.setState('openai.requeststate', requestState.Error, true);
			return false;
		});
}

//ToDo: Prepare all required states
// AIState.setValue('AI-Command-Messages', '[]');
// AIState.setValue('OpenAI-API-RequestState', 'Initialized', true);
// AIState.setValue('OpenAI-API-RequestError', '', true);

// on({ id: AIState.getId('AI-Command-Messages'), change: 'ne' }, async (obj) => {
// 	var AI_Control_Enabled = AIState.getValue('AI-Control-Enabled');

// 	if (!AI_Control_Enabled) {
// 		console.warn(AINotEnabledMessage);
// 		AIState.setValue('OpenAI-API-RequestState', 'Disabled', true);
// 		return;
// 	}
// 	AIState.setValue('OpenAI-API-RequestState', 'Setup', true);

// 	var AI_CommandMessages;

// 	try {
// 		AI_CommandMessages = JSON.parse(AIState.getValue('AI-Command-Messages'));
// 	} catch (err) {
// 		console.error('Error on JSON parse!');
// 		AIState.setValue('OpenAI-API-RequestState', 'Error', true);
// 		AIState.setValue('OpenAI-API-RequestError', JSON.stringify(err), true);
// 		console.error(err);
// 	}

// 	if (!AI_CommandMessages || AI_CommandMessages.length == 0) {
// 		console.warn('AI - got empty message command list');
// 		return;
// 	}

// 	console.log(['AI - got new Command: "', JSON.stringify(AI_CommandMessages), '" .'].join(''));

// 	var AIMessages = [];
// 	var SystemRole = AIState.getValue('OpenAI-API-System-Role');
// 	var DefaultMessageName = AIState.getValue('OpenAI-API-DefaultMessageName');
// 	AIMessages.push({ role: 'system', name: DefaultMessageName, content: SystemRole });
// 	AI_CommandMessages.forEach((command) => {
// 		AIMessages.push({ role: 'user', name: DefaultMessageName, content: command });
// 	});
// 	console.log(JSON.stringify(AIMessages));

// 	//parameter for chat completion api --> https://api.openai.com/v1/chat/completions
// 	var params = {
// 		messages: AIMessages,
// 		model: AIState.getValue('OpenAI-API-Model'),
// 		max_tokens: AIState.getValue('OpenAI-API-MaxTokens'),
// 		user: AIState.getValue('OpenAI-API-User'),
// 	};

// 	//parameter for completion api (legacy) --> https://api.openai.com/v1/completions
// 	// var params = {
// 	//     prompt: AI_TextCommand,
// 	//     //echo: true,
// 	//     model: getState('0_userdata.0.AI.OpenAI-API-Model').val,
// 	//     max_tokens: getState('0_userdata.0.AI.OpenAI-API-MaxTokens').val,
// 	//     //user: "MaxHRO"
// 	// }

// 	var commandTime = new Date();
// 	AIState.setValue('AI-Command-JSON', JSON.stringify(params));
// 	AIState.setValue('AI-Command-Timestamp', commandTime.toLocaleString('en-US'));

// 	var apiKey = AIState.getValue('OpenAI-API-Secret');
// 	var apiUrl = AIState.getValue('OpenAI-API-Url');
// 	var client = axios.create({
// 		headers: { Authorization: 'Bearer ' + apiKey },
// 	});

// 	console.log('Start Open API Request ...');
// 	AIState.setValue('OpenAI-API-RequestState', 'Start', true);
// 	//console.log("Params: " + client.);
// 	client
// 		.post(apiUrl, params)
// 		.then((result) => {
// 			var AI_Answer_JSON = JSON.stringify(result.data);
// 			AIState.setValue('AI-Answer-JSON', AI_Answer_JSON, true);

// 			var answerTime = new Date();
// 			AIState.setValue('AI-Answer-Timestamp', answerTime.toLocaleString('en-US'), true);
// 			AIState.setValue('OpenAI-API-RequestState', 'Success', true);

// 			result.data.choices.forEach((item) => {
// 				var AI_Answer_Text = item.message.content.trim(); //for chat completion
// 				//var AI_Answer_Text = item.text.trim(); //for completion (legacy)
// 				console.log(['AI - get answer: "', AI_Answer_Text, '" .'].join(''));
// 				AIState.setValue('AI-Answer-Text', AI_Answer_Text, true);
// 			});
// 		})
// 		.catch((err) => {
// 			console.error('Error on Open API Request!');
// 			AIState.setValue('OpenAI-API-RequestState', 'Error', true);
// 			AIState.setValue('OpenAI-API-RequestError', JSON.stringify(err), true);
// 			console.error(err);
// 		});
// });

module.exports = {
	requestState,
	getModels,
	apiTest,
};
