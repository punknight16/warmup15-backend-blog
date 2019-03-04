var http = require('http');

var data = {
	sprint_data: [
		{sprint_id: 's0', article_id: 'a1'}
	],
	article_data: [
		{article_id: 'a0', parent_id: null, sprint_id: 's0'},
		{article_id: 'a1', parent_id: 'a0', sprint_id: 's0'}
	]
}

var server = http.createServer(function(req, res){
	switch (req.url){
		case '/list':
			switch(req.method){
				case 'GET':
					res.end('I need a sprint_id');
					break;
				case 'POST':
					var post_str = '';
					var post_obj = {};
					var split_arr = [];
					req.setEncoding = 'utf8';
					req.on('data', function(chunk){
						post_str+=chunk;
					});
					req.on('end', function(){
						post_str.split('&').map((item)=>{
							split_arr = item.split('=');
							post_obj[split_arr[0]] = split_arr[1];
						});
						if(post_obj.hasOwnProperty('sprint_id')){
							//get the sprint obj
							var sprint_obj = data.sprint_data.find((item)=>{
								return (item.sprint_id==post_obj.sprint_id);
							})
							//list the article objects
							var article_arr = data.article_data.filter((item)=>{
								return (item.sprint_id == sprint_obj.sprint_id)
							});
							//build arr with a recursive link_list
							var article_id = sprint_obj.article_id;
							var result_arr = [];
							for (var i = article_arr.length - 1; i >= 0; i--) {
								var article_obj = article_arr.find((item)=>{
									return (item.article_id== article_id);
								})
								article_id = article_obj.parent_id;
								result_arr.push(article_obj);
							};
							res.end(JSON.stringify(sprint_obj)+JSON.stringify(result_arr));
						} else {
							res.end('need a sprint_id');
						}
					});
					break;
				default:
					res.end('bad list request');
			}
			break;
		case '/open-sprint': 
			var post_str = '';
			var post_obj = {};
			var split_arr = [];
			req.setEncoding = 'utf8';
			req.on('data', function(chunk){
				post_str+=chunk;
			});
			req.on('end', function(){
				post_str.split('&').map((item)=>{
					split_arr = item.split('=');
					post_obj[split_arr[0]] = split_arr[1];
				});
				//create the sprint
				if(post_obj.hasOwnProperty('text')){
					var sprint_id = 's'+data.sprint_data.length;
					var article_id = 'a'+data.article_data.length;
					var sprint_obj = {
						sprint_id: sprint_id,
						article_id: article_id
					};
					var article_obj = {
						sprint_id: sprint_id,
						article_id: article_id,
						parent_id: null,
						text: post_obj.text
					};
					data.article_data.push(article_obj);
					data.sprint_data.push(sprint_obj);
					res.end('created: '+sprint_id);
				} else {
					res.end('need text to create sprint');
				}
			});
			break;
		case '/add-article':
			var post_str = '';
			var post_obj = {};
			var split_arr = [];
			req.setEncoding = 'utf8';
			req.on('data', function(chunk){
				post_str+=chunk;
			});
			req.on('end', function(){
				post_str.split('&').map((item)=>{
					split_arr = item.split('=');
					post_obj[split_arr[0]] = split_arr[1];
				});
				//create the article and update the sprint
				if(post_obj.hasOwnProperty('text') && post_obj.hasOwnProperty('sprint_id')){
					//adding the article obj and updating the sprint_obj should be atomic
					var sprint_obj = data.sprint_data.find((item)=>{
						return (item.sprint_id == post_obj.sprint_id);
					});
					var article_id = 'a'+data.article_data.length;
					var article_obj = {
						sprint_id: post_obj.sprint_id,
						article_id: article_id,
						parent_id: sprint_obj.article_id,
						text: post_obj.text
					};
					data.article_data.push(article_obj);
					sprint_obj.article_id = article_id;
					res.end('created: '+article_id);
				} else {
					res.end('need text and sprint_id to add article');
				}
			});
			break;
		default:
			res.end('bad request');
	}
}).listen(3000)