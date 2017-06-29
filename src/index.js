var welcomeMessage = require("./welcome.md");
var aboutMessage = require("./about.html");

var _ = codebox.require("hr.utils");
var storage = codebox.require("hr.storage");

var commands = codebox.require("core/commands");
var dialogs = codebox.require("utils/dialogs");
var File = codebox.require("models/file");
var rpc = codebox.require("core/rpc");

// Infos
var helpUrl = "http://help.mimir.io/";
var feedbackUrl = "#";

// Cached methods
var about = function() {
    var currentVersion = codebox.workspace.get('version');
    var lastVersion = storage.get("codeboxVersion");

    if (lastVersion == null) {
        commands.run("application.welcome");
    } else if (currentVersion != lastVersion) {
        commands.run("application.changes");
    }
    storage.set("codeboxVersion", currentVersion);
};
var releasesNotes = _.memoize(rpc.execute.bind(rpc, "codebox/changes"));

// About dialog
commands.register({
    id: "application.about",
    title: "Application: About",
    run: function() {
        return dialogs.alert(_.template(aboutMessage)(codebox.workspace.toJSON()), { isHtml: true });
    }
});

// Welcome message
commands.register({
    id: "application.welcome",
    title: "Application: Welcome",
    run: function() {
        return commands.run("file.open", {
            file: File.buffer("welcome.md", welcomeMessage)
        })
    }
});

// Releases notes
commands.register({
    id: "application.changes",
    title: "Application: Show Releases Notes",
    run: function() {
        return releasesNotes()
        .get("content")
        .then(function(content) {
            return commands.run("file.open", {
                file: File.buffer("Releases Notes.md", content)
            })
        });
    }
});

// Open documentation
commands.register({
    id: "application.help",
    title: "Application: Open Documentation",
    shortcuts: [
        "?"
    ],
    run: function() {
        window.open(helpUrl);
    }
});

// Open feedback
//commands.register({
//    id: "application.feedback",
//    title: "Application: Send Feedback",
//    run: function() {
//        window.open(feedbackUrl);
//    }
//});

//codebox.statusbar.messages.collection.add({
//    content: "Send Feedback",
//    position: "right",
//    click: function() {
//        commands.run("application.feedback");
//    }
//});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;domain=" + TLD;
}
function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
// Open changes if version changes
codebox.app.once("ready", function() {
    if (!getCookie('mimirIDE-welcome')){
        about();
        setCookie('mimirIDE-welcome', 1, 100000);
    }
});
