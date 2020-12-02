const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 3000;
var cors = require("cors");
const neo4j = require("neo4j-driver").v1;
const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "1236")
);
const session = driver.session();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*const personName = 'Alice';
const resultPromise = session.run(
  'CREATE (a:Person {name: $name}) RETURN a',
  {name: personName}
);*/

app.post("/getGames", function(req, res) {
  var director = req.body.director
  var search = req.body.busqueda;
  var metascore = req.body.metascore;
  var limit = req.body.limit;
  var genre = req.body.genre;
  var modern = req.body.modern;
  var result = [];
  if (genre != "Cualquiera") {
    query = "MATCH(v: Movie) –[* 1] - (: Genre { name: '" + genre + "' })";
  } else {
    query = "MATCH (v: Movie)";
  }
  if (director != "Cualquiera") {
    query = query.concat("WHERE v.director = '" + director + "'");
  }

  if (search != "" && director != "Cualquiera") {
    query = query.concat(" AND (v.name =~ '(?i).*" + search + ".*') ");
  } else if (search != "") {
    query = query.concat(" WHERE (v.name =~ '(?i).*" + search + ".*') ");
  }

  if (modern) {
    query = query.concat(
      "RETURN v AS movie ORDER BY v.year DESC, v." +
        metascore +
        " DESC LIMIT " +
        limit
    );
  } else {
    query = query.concat(
      "RETURN v AS movie ORDER BY v." +
        metascore +
        " DESC, v.year DESC LIMIT " +
        limit
    );
  }

  const resultPromise = session.run(query).subscribe({
    onNext: function(record) {
      var element = record.get("movie").properties;

      if (element.year == undefined) {
        element.year = { low: "--" };
        result.push(element);
      } else {
        result.push(element);
      }
    },
    onCompleted: function() {
      if (result.length < 1) result = [{ message: "Error" }];
      res.send(result);
      // session.close();
    },
    onError: function(error) {
      console.log(error);
    }
  });
});

app.listen(port, function() {
  console.log("Example app listening on port " + 3000);
});
