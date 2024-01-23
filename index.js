var express = require( "express" );
var app = express();

app.use( express.static( __dirname + "/public" ) );

app.use( express.json() );
app.use( express.urlencoded( {
	extended : true
} ) );

var randomSentences = [
	"The small white buoys marked the location of hundreds of crab pots.",
	"It doesn't sound like that will ever be on my travel list.",
	"The group quickly understood that toxic waste was the most effective barrier to use against the zombies.",
	"There should have been a time and a place, but this wasn't it.",
	"Grape jelly was leaking out the hole in the roof.",
	"Each person who knows you has a different perception of who you are.",
	"Nothing is as cautiously cuddly as a pet porcupine.",
	"She wasn't sure whether to be impressed or concerned that he folded underwear in neat little packages.",
	"The Great Dane looked more like a horse than a dog.",
	"Plans for this weekend include turning wine into water."
];

var posts = [];

for( var i = 0; i < 5; i++ ) {
	var tags = [];
	if( Math.random() < 0.5 ) {
		tags.push( "Minimalism" );
	}
	if( Math.random() < 0.5 ) {
		tags.push( "Essentialism" );
	}
	if( Math.random() < 0.5 ) {
		tags.push( "Mindfulness" );
	}
	posts.push( {
		id : i,
		userID : 0,
		time : Date.now(),
		text : randomSentences[ Math.floor( Math.random() * randomSentences.length ) ],
		tags : tags,
		likes : [],
		comments : [ {
			userID : 0,
			time : Date.now(),
			text : "Good insightful post, thank you : )"
		} ]
	} );
}

var users = [
	{
		id : 0,
		username : "Username"
	},
	{
		id : 1,
		username : "Local User"
	}
]

function getUserByID( id ) {
	for( var i = 0; i < users.length; i++ ) {
		if( users[ i ].id == id ) {
			return users[ i ];
		}
	}
	return null;
}

function serializePost( post ) {
	return {
		id : post.id,
		userID : post.userID,
		username : getUserByID( post.userID ).username,
		time : post.time,
		text : post.text,
		tags : post.tags,
		likes : post.likes.length,
		comments : post.comments.length
	}
}

function serializeUserPublic( user ) {
	return {
		id : user.id,
		username : user.username
	}
}

function serializePostWithComments( post ) {
	var serial = serializePost( post );
	serial.comments = post.comments;
	for( var i = 0; i < serial.comments.length; i++ ) {
		serial.comments[ i ].username = getUserByID( post.comments[ i ].userID ).username;
	}
	return serial;
}

app.get( "/posts", function( req, res ) {
	var finalPosts = [];
	for( var i = 0; i < posts.length; i++ ) {
		finalPosts.push( serializePost( posts[ i ] ) );
	}
	return res.send( Object.values( finalPosts ) );
} );

app.get( "/posts/:postID", function( req, res ) {
	return res.send( posts[ req.params.postID ] );
} );

app.post( "/posts/search", function( req, res ) {
	var returnPosts = [];
	var searchTags = req.body.tags;
	var searchText = req.body.text.toLowerCase();
	for( var i = 0; i < posts.length; i++ ) {
		if( posts[ i ].text.toLowerCase().indexOf( searchText ) != -1 ) {
			var found = false;
			if( searchTags.length == 0 ) {
				found = true;
			}
			for( var u = 0; u < !found && posts[ i ].tags.length; u++ ) {
				for( var v = 0; v < searchTags.length; v++ ) {
					if( posts[ i ].tags[ u ] == searchTags[ v ] ) {
						found = true;
						break;
					}
				}
			}
			if( found ) {
				returnPosts.push( serializePost( posts[ i ] ) );
			}
		}
	}
	return res.send( returnPosts );
} );

app.get( "/posts/byuserID/:userID", function( req, res ) {
	var returnPosts = [];
	var userID = req.params.userID;
	for( var i = 0; i < posts.length; i++ ) {
		if( posts[ i ].userID == userID ) {
			returnPosts.push( serializePost( posts[ i ] ) );
		}
	}
	return res.send( returnPosts );
} );

app.post( "/posts/new", function( req, res ) {
	posts.push( {
		id : posts.length,
		userID : 1,
		time : Date.now(),
		text : req.body.text,
		tags : req.body.tags,
		likes : [],
		comments : []
	} );
	res.send( { result : "Success" } );
} );

app.get( "/users/:userID", function( req, res ) {
	return res.send( serializeUserPublic( getUserByID( req.params.userID ) ) );
} );

app.listen( 8080, function() {
	console.log( "Listening on 8080" );
} );