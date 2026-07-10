function make_slides(f) {
  var slides = {};

  slides.i0 = slide({
    name: "i0",
    start: function () {
      exp.startT = Date.now();
    },
  });

  slides.consent = slide({
  name: "consent",

  button: function () {
    exp.go();
  },
});

  slides.instructions = slide({
    name: "instructions",
    button: function () {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    },
  });

  slides.instructions1 = slide({
    name: "instructions1",
    start: function () {
      $(".bar").css("width", (100 * exp.phase) / exp.nQs + "%");
      var inst1 = "";
      //    	console.log(block_order);
      if (exp.stims_block1[0].block == "ai") {
        inst1 =
          inst1 +
          "First you'll answer questions about what the people at the party are asking about.";
      } else {
        inst1 =
          inst1 +
          "First you'll answer questions about what the people at the party are certain about.";
      }
      $("#inst1").html(inst1);
    },
    button: function () {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    },
  });

  slides.block1 = slide({
    name: "block1",
    present: exp.stims_block1,
    start: function () {
      $(".err").hide();
    },
    present_handle: function (stim) {
      $(".bar").css("width", (100 * exp.phase) / exp.nQs + "%");
      this.stim = stim;
      this.stim.trial_start = Date.now();
      $(".err").hide();
      this.init_sliders();
      exp.sliderPost = null;
      console.log(this.stim);
      //  if (this.stim.trigger_class == "control") {
      //       	var utterance = "<strong>"+this.stim.fact+"."+this.stim.name + ":</strong> \"<i>"+this.stim.utterance+"</i>\"";
      //       } else {
      //       	var utterance = "<strong>"+this.stim.name+":</strong> \"<i>"+this.stim.fact+". "+ this.stim.utterance+"</i>\"";
      //       }
      var utterance = "";
      // var utterance = "<p>"+this.stim.name + ": \"<i>"+this.stim.utterance+"</i>\"</p>" +"<p>"+this.stim.name2 + ": \"<i>Are you sure?</i>\"</p>"+this.stim.name + ": \"<i>Yes, I'm sure that "+this.stim.question+".</i>\""
      //var sentence = "<strong>Fact (which"+this.stim.name+"knows):</strong> \"<i>"+this.stim.fact+"."</i>\"";
      var sentence =
        "<strong>" +
        this.stim.name +
        ' asks:</strong> "<i>' +
        this.stim.utterance +
        '</i>"';
      $(".sentence").html(sentence);
      $(".utterance").html(utterance);
      var question = "";
      if (this.stim.trigger_class == "control") {
        question =
          "Is " + this.stim.name + " certain that " + this.stim.question + "?";
      } else {
        question =
          "Is " +
          this.stim.name +
          " certain that " +
          this.stim.question +
          " (" +
          this.stim.probe_text +
          ")?";
      }
      // console.log(this.stim.block);
      // 	  if (this.stim.block == "ai") {
      // 	  		question = "Is "+this.stim.name+" asking whether "+this.stim.question+"?";
      // 	  } else {
      // 	  		question = "Is "+this.stim.name+" certain that "+this.stim.question+"?";
      // 	  	}
      $(".question").html(question);
    },

    button: function () {
      console.log(exp.sliderPost);
      if (exp.sliderPost != null) {
        this.log_responses();
        _stream.apply(this); //use exp.go() if and only if there is no "present" data.
      } else {
        $(".err").show();
      }
    },
    init_sliders: function () {
      utils.make_slider("#single_slider", function (event, ui) {
        exp.sliderPost = ui.value;
      });
    },
    log_responses: function () {
      exp.data_trials.push({
        //"block" : "block1",
        //"question_type" : this.stim.block,
        slide_number_in_experiment: exp.phase,
        verb: this.stim.trigger,
        contentNr: this.stim.content,
        content: this.stim.question,
        speakerGender: this.stim.gender,
        fact: this.stim.fact,
        fact_type: this.stim.fact_type,
        utterance: this.stim.utterance,
        question: this.stim.content,
        subjectGender: this.stim.gender2,
        speakerName: this.stim.name,
        subjectName: this.stim.name2,
        trigger_class: this.stim.trigger_class,
        probe_text: this.stim.probe_text,
        response: exp.sliderPost,
        rt: Date.now() - this.stim.trial_start,
      });
    },
  });

  slides.questionaire = slide({
    name: "questionaire",
    submit: function (e) {
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language: $("#language").val(),
        //        enjoyment : $("#enjoyment").val(),
        assess: $('input[name="assess"]:checked').val(),
        american: $('input[name="american"]:checked').val(),
        gender: $('input[name="gender"]:checked').val(),
        //american : $("#american").val(),
        //american : $('input[name="american"]:checked').val(),
        age: $("#age").val(),
        //gender : $("#gender").val(),
        //        education : $("#education").val(),
        comments: $("#comments").val(),
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    },
  });

  slides.finished = slide({
    name: "finished",
    start: function () {
      exp.data = {
        trials: exp.data_trials,
        catch_trials: exp.catch_trials,
        system: exp.system,
        condition: exp.condition,
        subject_information: exp.subj_data,
        time_in_minutes: (Date.now() - exp.startT) / 60000,
      };
      setTimeout(function () {
        turk.submit(exp.data);
      }, 1000);
    },
  });

  return slides;
}

/// init ///
function init() {
  var speaker_names = _.shuffle([
    {
      name: "James",
      gender: "M",
    },
    //    {
    //      "name":"John",
    //      "gender":"M"
    //    },
    {
      name: "Robert",
      gender: "M",
    },
    //     {
    //       "name":"Michael",
    //       "gender":"M"
    //     },
    {
      name: "William",
      gender: "M",
    },
    {
      name: "David",
      gender: "M",
    },
    {
      name: "Richard",
      gender: "M",
    },
    //    {
    //       "name":"Joseph",
    //       "gender":"M"
    //     },
    //     {
    //       "name":"Charles",
    //       "gender":"M"
    //     },
    {
      name: "Thomas",
      gender: "M",
    },
    {
      name: "Christopher",
      gender: "M",
    },
    //    {
    //       "name":"Daniel",
    //       "gender":"M"
    //     },
    {
      name: "Matthew",
      gender: "M",
    },
    //    {
    //      "name":"Donald",
    //      "gender":"M"
    //    },
    //     {
    //       "name":"Anthony",
    //       "gender":"M"
    //     },
    {
      name: "Paul",
      gender: "M",
    },
    {
      name: "Mark",
      gender: "M",
    },
    {
      name: "George",
      gender: "M",
    },
    {
      name: "Steven",
      gender: "M",
    },
    {
      name: "Kenneth",
      gender: "M",
    },
    {
      name: "Jennifer",
      gender: "F",
    },
    {
      name: "Elizabeth",
      gender: "F",
    },
    {
      name: "Linda",
      gender: "F",
    },
    //     {
    //       "name":"Emily",
    //       "gender":"F"
    //     },
    {
      name: "Susan",
      gender: "F",
    },
    {
      name: "Margaret",
      gender: "F",
    },
    {
      name: "Jessica",
      gender: "F",
    },
    {
      name: "Dorothy",
      gender: "F",
    },
    {
      name: "Sarah",
      gender: "F",
    },
    {
      name: "Karen",
      gender: "F",
    },
    {
      name: "Nancy",
      gender: "F",
    },
    {
      name: "Betty",
      gender: "F",
    },
    {
      name: "Lisa",
      gender: "F",
    },
    {
      name: "Sandra",
      gender: "F",
    },
    {
      name: "Helen",
      gender: "F",
    },
    {
      name: "Ashley",
      gender: "F",
    },
    {
      name: "Donna",
      gender: "F",
    },
    {
      name: "Kimberly",
      gender: "F",
    },
    {
      name: "Carol",
      gender: "F",
    },
    {
      name: "Michelle",
      gender: "F",
    },
  ]);

  var female_subject_names = _.shuffle([
    //       {
    //         "name":"Emily",
    //         "gender":"F"
    //       },
    //    {
    //      "name":"Mary",
    //      "gender":"F"
    //    },
    {
      name: "Amanda",
      gender: "F",
    },
    {
      name: "Melissa",
      gender: "F",
    },
    //     {
    //       "name":"Deborah",
    //       "gender":"F"
    //     },
    {
      name: "Laura",
      gender: "F",
    },
    {
      name: "Stephanie",
      gender: "F",
    },
    {
      name: "Rebecca",
      gender: "F",
    },
    {
      name: "Sharon",
      gender: "F",
    },
    {
      name: "Cynthia",
      gender: "F",
    },
    {
      name: "Kathleen",
      gender: "F",
    },
    {
      name: "Ruth",
      gender: "F",
    },
    {
      name: "Anna",
      gender: "F",
    },
    {
      name: "Shirley",
      gender: "F",
    },
    {
      name: "Amy",
      gender: "F",
    },
    {
      name: "Angela",
      gender: "F",
    },
    {
      name: "Virginia",
      gender: "F",
    },
    {
      name: "Brenda",
      gender: "F",
    },
    {
      name: "Catherine",
      gender: "F",
    },
    {
      name: "Nicole",
      gender: "F",
    },
    {
      name: "Christina",
      gender: "F",
    },
    {
      name: "Janet",
      gender: "F",
    },
    //    {
    //       "name":"Samantha",
    //       "gender":"F"
    //     },
    {
      name: "Carolyn",
      gender: "F",
    },
    {
      name: "Rachel",
      gender: "F",
    },
    {
      name: "Heather",
      gender: "F",
    },
    {
      name: "Diane",
      gender: "F",
    },
    {
      name: "Joyce",
      gender: "F",
    },
    {
      name: "Julie",
      gender: "F",
    },
    //     {
    //       "name":"Emma",
    //       "gender":"F"
    //     }
  ]);

  var male_subject_names = _.shuffle([
    {
      name: "Andrew",
      gender: "M",
    },
    {
      name: "Edward",
      gender: "M",
    },
    //    {
    //       "name":"Joshua",
    //       "gender":"M"
    //     },
    {
      name: "Brian",
      gender: "M",
    },
    {
      name: "Kevin",
      gender: "M",
    },
    {
      name: "Ronald",
      gender: "M",
    },
    {
      name: "Timothy",
      gender: "M",
    },
    //    {
    //       "name":"Jason",
    //       "gender":"M"
    //     },
    {
      name: "Jeffrey",
      gender: "M",
    },
    {
      name: "Gary",
      gender: "M",
    },
    {
      name: "Ryan",
      gender: "M",
    },
    {
      name: "Nicholas",
      gender: "M",
    },
    {
      name: "Eric",
      gender: "M",
    },
    {
      name: "Jacob",
      gender: "M",
    },
    //   {
    //       "name":"Jonathan",
    //       "gender":"M"
    //     },
    {
      name: "Larry",
      gender: "M",
    },
    //    {
    //      "name":"Frank",
    //      "gender":"M"
    //    },
    {
      name: "Scott",
      gender: "M",
    },
    {
      name: "Justin",
      gender: "M",
    },
    {
      name: "Brandon",
      gender: "M",
    },
    {
      name: "Raymond",
      gender: "M",
    },
    {
      name: "Gregory",
      gender: "M",
    },
    //    {
    //       "name":"Samuel",
    //       "gender":"M"
    //     },
    {
      name: "Benjamin",
      gender: "M",
    },
    {
      name: "Patrick",
      gender: "M",
    },
    //    {
    //      "name":"Jack",
    //      "gender":"M"
    //    },
    //     {
    //       "name":"Dennis",
    //       "gender":"M"
    //     },
    {
      name: "Jerry",
      gender: "M",
    },
    {
      name: "Alexander",
      gender: "M",
    },
    {
      name: "Tyler",
      gender: "M",
    },
  ]);

  var items = _.shuffle([
    {
      trigger: "know",
      trigger_class: "NonProj",
    },
    {
      trigger: "discover",
      trigger_class: "NonProj",
    },
    {
      trigger: "reveal",
      trigger_class: "NonProj",
    },
    {
      trigger: "establish",
      trigger_class: "NonProj",
    },
    {
      trigger: "think",
      trigger_class: "NonProj",
    },
    {
      trigger: "suggest",
      trigger_class: "C",
    },
    {
      trigger: "prove",
      trigger_class: "C",
    },
    {
      trigger: "say",
      trigger_class: "C",
    },
    {
      trigger: "hear",
      trigger_class: "C",
    },
    {
      trigger: "inform_Sam",
      trigger_class: "C",
    },
    {
      trigger: "acknowledge",
      trigger_class: "C",
    },
    {
      trigger: "confirm",
      trigger_class: "C",
    },
  ]);

  var contents = {
    1: {
      gender: "f",
      content: "Mary ate some of the cupcakes",
      know: "Does Patrick know that Mary ate some of the cupcakes?",
      discover: "Did Patrick discover that Mary ate some of the cupcakes?",
      reveal: "Did Patrick reveal that Mary ate some of the cupcakes?",
      establish: "Did Patrick establish that Mary ate some of the cupcakes?",
      think: "Does Patrick think that Mary ate some of the cupcakes?",
      suggest: "Did Patrick suggest that Mary ate some of the cupcakes?",
      prove: "Did Patrick prove that Mary ate some of the cupcakes?",
      say: "Did Patrick say that Mary ate some of the cupcakes?",
      hear: "Did Patrick hear that Mary ate some of the cupcakes?",
      inform_Sam: "Did Patrick inform Sam that Mary ate some of the cupcakes?",
      acknowledge:
        "Did Patrick acknowledge that Mary ate some of the cupcakes?",
      confirm: "Did Patrick confirm that Mary ate some of the cupcakes?",
    },
    2: {
      gender: "f",
      content: "Josie failed some of the courses",
      know: "Does Scott know that Josie failed some of the courses?",
      discover: "Did Scott discover that Josie failed some of the courses?",
      reveal: "Did Scott reveal that Josie failed some of the courses?",
      establish: "Did Scott establish that failed some of the courses?",
      think: "Does Scott think that Josie failed some of the courses?",
      suggest: "Did Scott suggest that Josie failed some of the courses?",
      prove: "Did Scott prove that Josie failed some of the courses?",
      say: "Did Scott say that Josie failed some of the courses?",
      hear: "Did Scott hear that Josie failed some of the courses?",
      inform_Sam: "Did Scott inform Sam that Josie failed some of the courses?",
      acknowledge:
        "Did Scott acknowledge that Josie failed some of the courses?",
      confirm: "Did Scott confirm that Josie failed some of the courses?",
    },
    3: {
      gender: "f",
      content: "Emma used some of the office supplies",
      know: "Does Justin know that Emma used some of the office supplies?",
      discover:
        "Did Justin discover that Emma used some of the office supplies?",
      reveal: "Did Justin reveal that Emma used some of the office supplies?",
      establish:
        "Did Justin establish that Emma used some of the office supplies?",
      think: "Does Justin think that Emma used some of the office supplies?",
      suggest: "Did Justin suggest that Emma used some of the office supplies?",
      prove: "Did Justin prove that Emma used some of the office supplies?",
      say: "Did Justin say that Emma used some of the office supplies?",
      hear: "Did Justin hear that Emma used some of the office supplies?",
      inform_Sam:
        "Did Justin inform Sam that Emma used some of the office supplies?",
      acknowledge:
        "Did Justin acknowledge that Emma used some of the office supplies?",
      confirm: "Did Justin confirm that Emma used some of the office supplies?",
    },
    4: {
      gender: "m",
      content: "Danny solved some of the puzzles",
      know: "Does Jerry know that Danny solved some of the puzzles?",
      discover: "Did Jerry discover that Danny solved some of the puzzles?",
      reveal: "Did Jerry reveal that Danny solved some of the puzzles?",
      establish: "Did Jerry establish that Danny solved some of the puzzles?",
      think: "Does Jerry think that Danny solved some of the puzzles?",
      suggest: "Did Jerry suggest that Danny solved some of the puzzles?",
      prove: "Did Jerry prove that Danny solved some of the puzzles?",
      say: "Did Jerry say that Danny solved some of the puzzles?",
      hear: "Did Jerry hear that Danny solved some of the puzzles?",
      inform_Sam: "Did Jerry inform Sam that Danny solved some of the puzzles?",
      acknowledge:
        "Did Jerry acknowledge that Danny solved some of the puzzles?",
      confirm: "Did Jerry confirm that Danny solved some of the puzzles?",
    },
    5: {
      gender: "m",
      content: "Frank answered some of the questions",
      know: "Does Ben know that Frank answered some of the questions?",
      discover: "Did Ben discover that Frank answered some of the questions?",
      reveal: "Did Ben reveal that Frank answered some of the questions?",
      think: "Does Ben think that Frank answered some of the questions?",
      suggest: "Did Ben suggest that Frank answered some of the questions?",
      prove: "Did Ben prove that Frank answered some of the questions?",
      say: "Did Ben say that Frank answered some of the questions?",
      establish: "Did Ben establish that Frank answered some of the questions?",
      hear: "Did Ben hear that Frank answered some of the questions?",
      inform_Sam:
        "Did Ben inform Sam that Frank answered some of the questions?",
      acknowledge:
        "Did Ben acknowledge that Frank answered some of the questions?",
      confirm: "Did Ben confirm that Frank answered some of the questions?",
    },
    6: {
      gender: "m",
      content: "Jackson completed some of the assignments",
      know: "Does Ray know that Jackson completed some of the assignments?",
      discover:
        "Did Ray discover that Jackson completed some of the assignments?",
      reveal: "Did Ray reveal that Jackson completed some of the assignments?",
      establish:
        "Did Ray establish that Jackson completed some of the assignments?",
      think: "Does Ray think that Jackson completed some of the assignments?",
      suggest:
        "Did Ray suggest that Jackson completed some of the assignments?",
      prove: "Did Ray prove that Jackson completed some of the assignments?",
      say: "Did Ray say that Jackson completed some of the assignments?",
      hear: "Did Ray hear that Jackson completed some of the assignments?",
      inform_Sam:
        "Did Ray inform Sam that Jackson completed some of the assignments?",
      acknowledge:
        "Did Ray acknowledge that Jackson completed some of the assignments?",
      confirm:
        "Did Ray confirm that Jackson completed some of the assignments?",
    },
    7: {
      gender: "f",
      content: "Isabella ate cake or pie",
      know: "Does Kevin know that Isabella ate cake or pie?",
      discover: "Did Kevin discover that Isabella ate cake or pie?",
      reveal: "Did Kevin reveal that Isabella ate cake or pie?",
      establish: "Did Kevin establish that Isabella ate cake or pie?",
      think: "Does Kevin think that Isabella ate cake or pie?",
      suggest: "Did Kevin suggest that Isabella ate cake or pie?",
      prove: "Did Kevin prove that Isabella ate cake or pie?",
      say: "Did Kevin say that Isabella ate cake or pie?",
      hear: "Did Kevin hear that Isabella ate cake or pie?",
      inform_Sam: "Did Kevin inform Sam that Isabella ate cake or pie?",
      acknowledge: "Did Kevin acknowledge that Isabella ate cake or pie?",
      confirm: "Did Kevin confirm that Isabella ate cake or pie?",
    },
    8: {
      gender: "f",
      content: "Emily failed math or science",
      know: "Does Brian know that Emily failed math or science?",
      discover: "Did Brian discover that Emily failed math or science?",
      reveal: "Did Brian reveal that Emily failed math or science?",
      establish: "Did Brian establish that Emily failed math or science?",
      think: "Does Brian think that Emily failed math or science?",
      suggest: "Did Brian suggest that Emily failed math or science?",
      prove: "Did Brian prove that Emily failed math or science?",
      say: "Did Brian say that Emily failed math or science?",
      hear: "Did Brian hear that Emily failed math or science?",
      inform_Sam: "Did Brian inform Sam that Emily failed math or science?",
      acknowledge: "Did Brian acknowledge that Emily failed math or science?",
      confirm: "Did Brian confirm that Emily failed math or science?",
    },
    9: {
      gender: "f",
      content: "Grace used pens or markers",
      know: "Does Andrew know that Grace used pens or markers?",
      discover: "Did Andrew discover that Grace used pens or markers?",
      reveal: "Did Andrew reveal that Grace used pens or markers?",
      establish: "Did Andrew establish that Grace used pens or markers?",
      think: "Does Andrew think that Grace used pens or markers?",
      suggest: "Did Andrew suggest that Grace used pens or markers?",
      prove: "Did Andrew prove that Grace used pens or markers?",
      say: "Did Andrew say that Grace used pens or markers?",
      hear: "Did Andrew hear that Grace used pens or markers?",
      inform_Sam: "Did Andrew inform Sam that Grace used pens or markers?",
      acknowledge: "Did Andrew acknowledge that Grace used pens or markers?",
      confirm: "Did Andrew confirm that Grace used pens or markers?",
    },
    10: {
      gender: "m",
      content: "Jayden solved the puzzles or problems",
      know: "Does Tim know that Jayden solved the puzzles or problems?",
      discover: "Did Tim discover that Jayden solved the puzzles or problems?",
      reveal: "Did Tim reveal that Jayden solved the puzzles or problems?",
      establish:
        "Did Tim establish that Jayden solved the puzzles or problems?",
      think: "Does Tim think that Jayden solved the puzzles or problems?",
      suggest: "Did Tim suggest that Jayden solved the puzzles or problems?",
      prove: "Did Tim prove that Jayden solved the puzzles or problems?",
      say: "Did Tim say that Jayden solved the puzzles or problems?",
      hear: "Did Tim hear that Jayden solved the puzzles or problems?",
      inform_Sam:
        "Did Tim inform Sam that Jayden solved the puzzles or problems?",
      acknowledge:
        "Did Tim acknowledge that Jayden solved the puzzles or problems?",
      confirm: "Did Tim confirm that Jayden solved the puzzles or problems?",
    },
    11: {
      gender: "m",
      content: "Tony answered emails or calls",
      know: "Does Amanda know that Tony answered emails or calls?",
      discover: "Did Amanda discover that Tony answered emails or calls?",
      reveal: "Did Amanda reveal that Tony answered emails or calls?",
      establish: "Did Amanda establish that Tony answered emails or calls?",
      think: "Does Amanda think that Tony answered emails or calls?",
      suggest: "Did Amanda suggest that Tony answered emails or calls?",
      prove: "Did Amanda prove that Tony answered emails or calls?",
      say: "Did Amanda say that Tony answered emails or calls?",
      hear: "Did Amanda hear that Tony answered emails or calls?",
      inform_Sam: "Did Amanda inform Sam that Tony answered emails or calls?",
      acknowledge: "Did Amanda acknowledge that Tony answered emails or calls?",
      confirm: "Did Amanda confirm that Tony answered emails or calls?",
    },
    12: {
      gender: "m",
      content: "Josh bought coffee or tea",
      know: "Does Melissa know that Josh bought coffee or tea?",
      discover: "Did Melissa discover that Josh bought coffee or tea?",
      reveal: "Did Melissa reveal that Josh bought coffee or tea?",
      establish: "Did Melissa establish that Josh bought coffee or tea?",
      think: "Does Melissa think that Josh bought coffee or tea?",
      suggest: "Did Melissa suggest that Josh bought coffee or tea?",
      prove: "Did Melissa prove that Josh bought coffee or tea?",
      say: "Did Melissa say that Josh bought coffee or tea?",
      hear: "Did Melissa hear that Josh bought coffee or tea?",
      inform_Sam: "Did Melissa inform Sam that Josh bought coffee or tea?",
      acknowledge: "Did Melissa acknowledge that Josh bought coffee or tea?",
      confirm: "Did Melissa confirm that Josh bought coffee or tea?",
    },
  };

  var facts = {
    1: {
      factH: "Mary is taking a prenatal yoga class",
      factL: "Mary is a middle school student",
    },
    2: {
      factH: "Josie loves France",
      factL: "Josie doesn't have a passport",
    },
    3: {
      factH: "Emma is in law school",
      factL: "Emma is in first grade",
    },
    4: {
      factH: "Olivia works the third shift",
      factL: "Olivia has two small children",
    },
    5: {
      factH: "Sophia is a hipster",
      factL: "Sophia is a high end fashion model",
    },
    6: {
      factH: "Mia is a college student",
      factL: "Mia is a nun",
    },
    7: {
      factH: "Isabella is from Argentina",
      factL: "Isabella is a vegetarian",
    },
    8: {
      factH: "Emily has been saving for a year",
      factL: "Emily never has any money",
    },
    9: {
      factH: "Grace loves her sister",
      factL: "Grace hates her sister",
    },
    10: {
      factH: "Zoe is a math major",
      factL: "Zoe is 5 years old",
    },
    11: {
      factH: "Danny loves cake",
      factL: "Danny is a diabetic",
    },
    12: {
      factH: "Frank has always wanted a pet",
      factL: "Frank is allergic to cats",
    },
  };

  var items_content_mapping = {
    know: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    discover: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    reveal: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    establish: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    think: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    suggest: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    prove: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    say: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    hear: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    inform_Sam: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    acknowledge: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ],
    confirm: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
  };
  var content_fact_mapping = {
    1: ["factH", "factL"],
    2: ["factH", "factL"],
    3: ["factH", "factL"],
    4: ["factH", "factL"],
    5: ["factH", "factL"],
    6: ["factH", "factL"],
    7: ["factH", "factL"],
    8: ["factH", "factL"],
    9: ["factH", "factL"],
    10: ["factH", "factL"],
    11: ["factH", "factL"],
    12: ["factH", "factL"],
  };
  var some_contents = _.shuffle(["1", "2", "3", "4", "5", "6"]);
  var or_contents = _.shuffle(["7", "8", "9", "10", "11", "12"]);
  var probe_by_content = {};

  some_contents.slice(0, 3).forEach(function (c) {
    probe_by_content[c] = "and possibly all of them";
  });

  some_contents.slice(3, 6).forEach(function (c) {
    probe_by_content[c] = "but not all of them";
  });

  or_contents.slice(0, 3).forEach(function (c) {
    probe_by_content[c] = "but not both";
  });

  or_contents.slice(3, 6).forEach(function (c) {
    probe_by_content[c] = "and possibly both";
  });
  // get trigger contents
  function getContent(trigger) {
    //  		console.log("items_content_mapping before throwing out "+trigger);
    //  		console.log(items_content_mapping);
    //  		for (var j in items_content_mapping) {
    //  		console.log("items_content_mapping at "+j);
    //  		console.log(items_content_mapping[j]);
    //  		}
    //  		console.log("items_content_mapping at the trigger before shuffling");
    //  		console.log(items_content_mapping[trigger]);
    items_content_mapping[trigger] = _.shuffle(items_content_mapping[trigger]);
    //  		console.log("items_content_mapping at the trigger after shuffling");
    //  		console.log(items_content_mapping[trigger]);
    //  		console.log("items_content_mapping after shuffling "+trigger);
    //  		console.log(items_content_mapping);
    var content = items_content_mapping[trigger].shift(); //items_content_mapping[trigger][0];
    //  		console.log("this is the selected content: " + content);
    //		var index = items_content_mapping[trigger].indexOf(content);
    //  		items_content_mapping[trigger] = items_content_mapping[trigger].splice(index,1);
    //  		console.log("items_content_mapping at the trigger after throwing it out");
    //  		console.log(items_content_mapping[trigger]);
    for (var j in items_content_mapping) {
      var index = items_content_mapping[j].indexOf(content);
      //			console.log("the next three lines: the array before removal, the index of content, the array after removal")
      //			console.log(items_content_mapping[j]);
      //			console.log(index);
      if (index != -1) {
        items_content_mapping[j].splice(index, 1);
      }
      //			console.log(items_content_mapping[j]);
    }
    //  		console.log("items_content_mapping after throwing out "+trigger);
    //  		console.log(items_content_mapping);
    //  		for (var j in items_content_mapping) {
    //  		console.log("items_content_mapping at "+j);
    //  		console.log(items_content_mapping[j]);
    //  		}
    return content;
  }

  // get content facts
  function getFact(content) {
    //  		console.log("items_content_mapping before throwing out "+trigger);
    //  		console.log(items_content_mapping);
    //  		for (var j in items_content_mapping) {
    //  		console.log("items_content_mapping at "+j);
    //  		console.log(items_content_mapping[j]);
    //  		}
    //  		console.log("items_content_mapping at the trigger before shuffling");
    //  		console.log(items_content_mapping[trigger]);
    content_fact_mapping[content] = _.shuffle(content_fact_mapping[content]);
    //  		console.log("items_content_mapping at the trigger after shuffling");
    //  		console.log(items_content_mapping[trigger]);
    //  		console.log("items_content_mapping after shuffling "+trigger);
    //  		console.log(items_content_mapping);
    var factType = content_fact_mapping[content].shift(); //items_content_mapping[trigger][0];
    //  		console.log("this is the selected content: " + content);
    //		var index = items_content_mapping[trigger].indexOf(content);
    //  		items_content_mapping[trigger] = items_content_mapping[trigger].splice(index,1);
    //  		console.log("items_content_mapping at the trigger after throwing it out");
    //  		console.log(items_content_mapping[trigger]);
    //  		for (var j in items_content_mapping) {
    //			var index = items_content_mapping[j].indexOf(content);
    //			console.log("the next three lines: the array before removal, the index of content, the array after removal")
    //			console.log(items_content_mapping[j]);
    //			console.log(index);
    //			if (index != -1)
    //			{
    //				items_content_mapping[j].splice(index,1);
    //			}
    //			console.log(items_content_mapping[j]);
    //  		}
    //  		console.log("items_content_mapping after throwing out "+trigger);
    //  		console.log(items_content_mapping);
    //  		for (var j in items_content_mapping) {
    //  		console.log("items_content_mapping at "+j);
    //  		console.log(items_content_mapping[j]);
    //  		}
    return factType;
  }

  // assign contents to triggers
  var trigger_contents = {
    know: getContent("know"),
    discover: getContent("discover"),
    reveal: getContent("reveal"),
    establish: getContent("establish"),
    think: getContent("think"),
    suggest: getContent("suggest"),
    prove: getContent("prove"),
    say: getContent("say"),
    hear: getContent("hear"),
    inform_Sam: getContent("inform_Sam"),
    acknowledge: getContent("acknowledge"),
    confirm: getContent("confirm"),
  };

  // assign facts to contents
  var content_facts = {
    1: getFact("1"),
    2: getFact("2"),
    3: getFact("3"),
    4: getFact("4"),
    5: getFact("5"),
    6: getFact("6"),
    7: getFact("7"),
    8: getFact("8"),
    9: getFact("9"),
    10: getFact("10"),
    11: getFact("11"),
    12: getFact("12"),
  };

  control_items = [
    {
      item_id: "control1",
      short_trigger: "control",
      utterance: "Is Zack coming to the meeting tomorrow?",
      content: "Zack is coming to the meeting tomorrow",
      fact: "Zack is a member of the golf club",
    },
    {
      item_id: "control2",
      short_trigger: "control",
      utterance: "Is Mary's aunt sick?",
      content: "Mary's aunt is sick",
      fact: "Mary visited her aunt on Sunday",
    },
    {
      item_id: "control3",
      short_trigger: "control",
      utterance: "Did Todd play football in high school?",
      content: "Todd played football in high school",
      fact: "Todd goes to the gym 3 times a week",
    },
    {
      item_id: "control4",
      short_trigger: "control",
      utterance: "Is Vanessa good at math?",
      content: "Vanessa is good at math",
      fact: "Vanessa won a prize at school",
    },
    {
      item_id: "control5",
      short_trigger: "control",
      utterance: "Did Madison have a baby?",
      content: "Madison had a baby",
      fact: "Trish sent Madison a card",
    },
    {
      item_id: "control6",
      short_trigger: "control",
      utterance: "Was Hendrick's car expensive?",
      content: "Hendrick's car was expensive",
      fact: "Hendrick just bought a car",
    },
  ];

  function makeControlStim(i) {
    //get item
    var item = control_items[i];
    //get a name to be speaker
    var name_data = speaker_names[i];
    var name = name_data.name;
    var gender = name_data.gender;

    return {
      name: name,
      name2: "NA",
      gender: gender,
      gender2: "NA",
      trigger: item.short_trigger,
      short_trigger: item.short_trigger,
      trigger_class: "control",
      content: item.item_id,
      fact: item.fact,
      fact_type: "NA",
      utterance: item.utterance,
      question: item.content,
    };
  }

  function makeStim(i, factType) {
    //get item
    var item = items[i];
    //get a name to be speaker
    var name_data = speaker_names[i];
    var name = name_data.name;
    var gender = name_data.gender;

    // get content
    var trigger_cont = trigger_contents[item.trigger];
    var trigger = item.trigger;
    var short_trigger = trigger;

    // get fact for that content
    // var	factType = content_facts[trigger_cont];

    console.log(trigger_cont + " " + factType);

    //   console.log("short_trigger: "+short_trigger);
    //	console.log("trigger: "+trigger);
    //	console.log(trigger_cont);
    //  console.log("trigger_cont: "+trigger_cont);
    //   console.log("utterance: "+contents[trigger_cont][short_trigger]);
    //   console.log(contents[trigger_cont]);
    //    console.log(trigger_cont);
    //var fact = facts[trigger_cont][fact];
    var utterance = contents[trigger_cont][short_trigger];
    var question = contents[trigger_cont].content;
    var fact = facts[trigger_cont][factType];
    var probe_text = probe_by_content[trigger_cont];
    var factType = factType;
    console.log(fact);
    //   console.log(contents[trigger_cont]);
    //    console.log(question)
    //get another name to be subject
    var name_data2 =
      contents[trigger_cont].gender == "m"
        ? female_subject_names[i]
        : male_subject_names[i];
    var name2 = name_data2.name;
    var gender2 = name_data2.gender;
    return {
      name: name,
      name2: name2,
      gender: gender,
      gender2: gender2,
      trigger: item.trigger,
      short_trigger: short_trigger,
      trigger_class: item.trigger_class,
      fact: fact,
      fact_type: factType,
      content: trigger_cont,
      utterance: utterance,
      question: question,
      probe_text: probe_text,
    };
  }
  exp.stims_block1 = [];
  //   exp.stims_block2 = [];
  for (var i = 0; i < items.length; i++) {
    var stim =
      i < items.length / 2 ? makeStim(i, "factL") : makeStim(i, "factH");
    //    exp.stims_block1.push(makeStim(i));
    exp.stims_block1.push(jQuery.extend(true, {}, stim));
    //	exp.stims_block2.push(jQuery.extend(true, {}, stim));
  }

  for (var j = 0; j < control_items.length; j++) {
    var stim = makeControlStim(j);
    //    exp.stims_block1.push(makeStim(i));
    exp.stims_block1.push(jQuery.extend(true, {}, stim));
    //	exp.stims_block2.push(jQuery.extend(true, {}, stim));
  }

  console.log(exp.stims_block1);
  //console.log(exp.stims_block2);

  exp.stims_block1 = _.shuffle(exp.stims_block1);
  //	exp.stims_block2 = _.shuffle(exp.stims_block2);

  // decide which block comes first
  //   var block_order = _.shuffle(["ai","projective"]);
  //   var block1type = block_order[0];
  //   var block2type = block_order[1];
  //   console.log(block_order);
  //   console.log(block1type);
  //   console.log(block2type);
  //
  //    for (k in exp.stims_block2) {
  //    		exp.stims_block2[k].block = block2type;//block_order[1];
  //    	}
  //
  //    for (i in exp.stims_block1) {
  //    		exp.stims_block1[i].block = block1type;//block_order[0];
  //    	}

  console.log(exp.stims_block1);
  //console.log(exp.stims_block2);

  //  exp.all_stims = [];
  //  for (var i=0; i<items.length; i++) {
  //    exp.all_stims.push(makeStim(i));
  //  }
  //
  //	for (k in exp.all_stims) {
  //		console.log(exp.all_stims[k].content)
  //		}

  exp.trials = [];
  exp.catch_trials = [];
  exp.condition = {}; //can randomize between subject conditions here
  exp.system = {
    Browser: BrowserDetect.browser,
    OS: BrowserDetect.OS,
    screenH: screen.height,
    screenUH: exp.height,
    screenW: screen.width,
    screenUW: exp.width,
  };
  //blocks of the experiment:
  exp.structure = ["i0",  "consent", "block1", "questionaire", "finished"];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
  //relies on structure and slides being defined

  // exp.nQs = 2 + 20 + 1;
  $(".nQs").html(exp.nQs);

  $(".slide").hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function () {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function () {
        $("#mustaccept").show();
      });
      exp.go();
    }
  });

  exp.go(); //show first slide
}
