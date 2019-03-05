var http = require('http');

var data = {
	cred_data: [
		{cred_id: 'c0'}
	],
	goal_data: [
		{goal_id: 'g1'}
	],
	link_data: [
		{goal_id: 'g1', cred_id: 'c0'}
	],
	sprint_data: [
		{sprint_id: 's0', article_id: 'a1', cred_id: 'c0', goal_id: 'g1'}
	],
	article_data: [
		{article_id: 'a0', parent_id: null, sprint_id: 's0', text: 'first #career'},
		{article_id: 'a1', parent_id: 'a0', sprint_id: 's0', text: 'second #career'}
	],
	tag_data: [
		{tag_name: 'career', goal_id: 'g1', sprint_id: 's0', article_id: 'a1'},
		{tag_name: 'career', goal_id: 'g1', sprint_id: 's0', article_id: 'a2'}
	],
	ledger_data: []
}

var server = http.createServer(function(req, res){
	switch (req.url){
		case '/index':
			res.write('<html>')
			res.write('<ul>');
				res.write("<li style='list-style-type: none'>/home - list the goals of logged_in user to prioritize</li>");
				res.write("<li style='margin-left:20px'>./#id to open a sprint or view it already exists</li>")
				res.write("<li style='margin-left:20px'>./?tags= to search for goals that have associated article #\'s</li>");
			res.write('</ul>');
			res.write('<ul>');
				res.write("<li style='list-style-type: none'>/browse - list goals of all to add them to your home</li>");
				res.write("<li style='margin-left:20px'>./#id to inspect all plans (1st articles) associated with that goal</li>");
				res.write("<li style='margin-left:20px'>./?tags= to search for goals that have associated article #\'s</li>");
			res.write('</ul>');
			res.write('<ul>');
				res.write("<li style='list-style-type: none'>/favorites - list sprints by hearts to send them hearts</li>");
				res.write("<li style='margin-left:20px'>./#id to inspect a sprint</li>")
			res.write('</ul>');
			res.write('<ul>');
				res.write("<li style='list-style-type: none'>/user - list users BY_activity_per_day</li>");
				res.write("<li style='margin-left:20px'>./#id to inspect bookmarked goals of a user</li>")
			res.write('</ul>');
			res.end('</html>');
			break;
		case '/search':
			console.log('req.method');
			switch(req.method){
				case 'GET':
					res.end('I need a search tag');
					break;
				case 'POST':
					//receive post data
					var post_str = '';
					var post_obj = {};
					var split_arr = [];
					req.setEncoding = 'utf8';
					req.on('data', function(chunk){
						post_str+=chunk;
					});
					req.on('end', function(){
						//might have to do some regular expressions here for # and @
						post_str.split('&').map((item)=>{
							split_arr = item.split('=');
							post_obj[split_arr[0]] = split_arr[1];
						});
						//for each search term
						if(post_obj.hasOwnProperty('q')){
							var search_term_arr = post_obj.q.split('+');
							var reduced_tags = {};
							for (var i = data.tag_data.length - 1; i >= 0; i--) {
								if(search_term_arr.indexOf(data.tag_data[i].tag_name)>-1){
									if(typeof reduced_tags[data.tag_data[i].goal_id]=='undefined'){
										reduced_tags[data.tag_data[i].goal_id] = 1;	
									} else {
										reduced_tags[data.tag_data[i].goal_id]++
									}
								}
							};
							var result_arr = [];
							for (k in reduced_tags){
								result_arr.push({goal_id: k, total_tags: reduced_tags[k]})
							}
							res.end(JSON.stringify(result_arr));
						} else {
							res.end('no tags received');
						}
					});
					break;
				default:
					res.end('bad list request');
			}
			break;
		case '/inspect':
			switch(req.method){
				case 'GET':
					res.end('I need a sprint_id');
					break;
				case 'POST':
					//receive post data
					var post_str = '';
					var post_obj = {};
					var split_arr = [];
					req.setEncoding = 'utf8';
					req.on('data', function(chunk){
						post_str+=chunk;
					});
					req.on('end', function(){
						//might have to do some regular expressions here for # and @
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
				//create the article, a tag for each#, and update the sprint
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
					//here is the tag stuff
					var myRegexp = /#(\S+)/g, result;
					var counter = 0;
					while (result = myRegexp.exec(post_obj.text)) {
					   var tag_obj = {
					   	tag_name: result[1],
					   	goal_id: sprint_obj.goal_id,  
					   	sprint_id: post_obj.sprint_id, 
					   	article_id: article_id
					   }
					   data.tag_data.push(tag_obj);
					   counter++;
					}
					res.end('created: '+article_id+'with '+ counter+ ' #s');
				} else {
					res.end('need text and sprint_id to add article');
				}
			});
			break;
		default:
			res.end('bad request');
	}
}).listen(3000)