var express = require("express");
var app = express();

// set up BodyParser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// import the Course class from Course.js
var Course = require("./Course.js");

/***************************************/

// endpoint for adding a new course
// this is the action of the "add new course" form
app.use("/add", async (req, res) => {
  // construct the Course from the form data which is in the request body
  var newCourse = new Course({
    name: req.body.name,
    number: req.body.number,
    instructor: req.body.instructor,
    department: req.body.department,
    school: req.body.school,
    description: req.body.description,
    rating: req.body.rating,
  });

  // save the course to the database
  try {
    const result = await newCourse.save();
    res.send("successfully added " + newCourse.name + " to the database");
  } catch (err) {
    res.type("html").status(200);
    res.write("uh oh: " + err);
    console.log(err);
    res.end();
  }
  //   newCourse.save((err) => {
  //     if (err) {
  //       res.type("html").status(200);
  //       res.write("uh oh: " + err);
  //       console.log(err);
  //       res.end();
  //     } else {
  //       // display the "successfull added" message
  //       res.send("successfully added " + newCourse.name + " to the database");
  //     }
  //   });
});

// User Story 1, the following are just examples from Lab 5, need to be re-implemented
// endpoint for showing all the courses
// app.use("/all", (req, res) => {
//   // find all the Course objects in the database
//   Course.find({}, (err, courses) => {
//     if (err) {
//       res.type("html").status(200);
//       console.log("uh oh" + err);
//       res.write(err);
//     } else {
//       if (courses.length == 0) {
//         res.type("html").status(200);
//         res.write("There are no courses");
//         res.end();
//         return;
//       } else {
//         res.type("html").status(200);
//         res.write("Here are the courses in the database:");
//         res.write("<ul>");
//         // show all the courses
//         courses.forEach((course) => {
//           res.write("<li>");
//           res.write(
//             "Course Name: " + course.name + "; Course Number: " + course.number
//           );
//           // this creates a link to the /delete endpoint
//           res.write(' <a href="/delete?name=' + course.name + '">[Delete]</a>');
//           res.write("</li>");
//         });
//         res.write("</ul>");
//         res.end();
//       }
//     }
//   }).sort({ number: "asc" }); // this sorts them BEFORE rendering the results
// });

// User Story 4
// delete a course
app.use("/delete", async (req, res) => {
  var filter = { number: req.body.number };
  try {
    const result = await Course.findOneAndDelete(filter);
    console.log(result);
  } catch (err) {
    console.log("error");
  }
  // Course.findOneAndDelete(filter, (err, course) => {
  //   if (err) {
  //     console.log("error");
  //   } else if (!course) {
  //     console.log("no course");
  //   } else {
  //     console.log("success");
  //   }
  // });
});

// Example from Lab 5, need to be re-implemented
// endpoint for accessing data via the web api
// to use this, make a request for /api to get an array of all Course objects
// or /api?name=[whatever] to get a single object
// app.use("/api", (req, res) => {
//   // construct the query object
//   var queryObject = {};
//   if (req.query.name) {
//     // if there's a name in the query parameter, use it here
//     queryObject = { name: req.query.name };
//   }

//   Course.find(queryObject, (err, courses) => {
//     console.log(courses);
//     if (err) {
//       console.log("uh oh" + err);
//       res.json({});
//     } else if (courses.length == 0) {
//       // no objects found, so send back empty json
//       res.json({});
//     } else if (courses.length == 1) {
//       var course = courses[0];
//       // send back a single JSON object
//       res.json({ name: course.name, number: course.number });
//     } else {
//       // construct an array out of the result
//       var returnArray = [];
//       courses.forEach((course) => {
//         returnArray.push({ name: course.name, number: course.number });
//       });
//       // send it back as JSON Array
//       res.json(returnArray);
//     }
//   });
// });

/**
 * User Story 3
 * Author: Xinran
 * Date modified: Mar 19, 2022
 * edit information about a specific course
 * @Param number: the course number for the course (primary key)
 */
app.use("/edit", (req, res) => {
  var courseNum = req.query.number;
  if (!courseNum) {
    console.log("No course number inputted!");
    res.json({ status: "No key inputted" });
  }

  var filter = { number: courseNum };
  var courseName = req.query.name;
  var instructor = req.query.instructor;
  var department = req.query.department;
  var school = req.query.school;
  var description = req.query.description;

  var action = {};
  if (courseName) {
    action["$set"]["name"] = courseName;
  }
  if (instructor) {
    action["$set"]["instructor"] = instructor;
  }
  if (department) {
    action["$set"]["department"] = department;
  }
  if (school) {
    action["$set"]["school"] = school;
  }
  if (description) {
    action["$set"]["description"] = description;
  }

  Course.findOneAndUpdate(filter, action, (e, p) => {
    if (e) {
      res.json({ status: e });
    } else if (!p) {
      res.json({ status: "Course Not found" });
    } else {
      res.json({ status: "updated" });
    }
  });
});

/**
 * User Story 7
 * Author: Xinran
 * Date modified: Mar 19, 2022
 * view the comments made about a specified course
 * @Param number: the course number for the course (primary key)
 */
app.use("/viewComments", (req, res) => {
  var courseNum = req.query.number;
  var queryObject = {};
  if (!courseNum) {
    console.log("No course number inputted!");
    res.json({});
  } else {
    queryObject = { number: courseNum };
  }
  Course.find(queryObject, (err, courses) => {
    console.log(courses);
    if (err) {
      console.log("error" + err);
      res.json({});
    } else if (courses.length == 0) {
      console.log("empty array");
      res.json({});
    } else {
      // since number is primary key, it is not possible to have more than one course having the same name
      var singleCourse = course[0];
      var comments = singleCourse.comments;
      res.json(comments);
    }
  });
});

/**
 * User story 7
 * Author: Xinran
 * Date modified: Mar 19. 2022
 * edit or delete the comment for a specific course
 * @Param number: the course number for the course (primary key)
 * @Param _id: the id for the comment to be deleted or edited
 * @Param text: the updated text, if empty then delete
 * @Param delete: whether or not to delete the text, if has a value, then delete
 */
app.use("/editOrDeleteComments", (req, res) => {
  var courseNum = req.query.number;
  var comment_id = req.query._id;
  var toDelete = req.query.delete;
  var text = req.query.text;
  var queryObject = {};
  if (!courseNum || !comment_id) {
    console.log("No course number inputted!");
    res.json({});
  } else {
    queryObject = { number: courseNum, "comments._id": comment_id };
  }
  // only when text has a value
  if (text & !toDelete) {
    var action = { $set: { "comments.text": text } };
    Course.findOneAndUpdate(queryObject, action, (err, course) => {
      console.log(courses);
      if (err) {
        console.log("error: " + err);
        res.json({ status: err });
      } else if (!course) {
        console.log("course not found");
        res.json({ status: "course not found" });
      } else {
        res.json({ status: "edit succeed" });
      }
    });
  } else {
    queryObject = { number: courseNum };
    Course.find(queryObject, (e, courses) => {
      if (e) {
        console.log("error: " + e);
        res.json({ status: e });
      } else if (courses.length == 0) {
        console.log("course not found");
        res.json({ status: "course not found" });
      } else {
        // unique id for course, thus only one will be returned
        courses[0].comments.id(_id).remove(); // delete the comment with id (_id)
        courses[0].save((err) => {
          if (err) {
            console.log("delete comment failed");
            res.json({ status: err });
          } else {
            res.json({ status: "delete success" });
          }
        });
      }
    });
  }
});
/*************************************************/

app.use("/templates", express.static("templates"));

app.use("/", (req, res) => {
  res.redirect("/templates/homepage.html");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
