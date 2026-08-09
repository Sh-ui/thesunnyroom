// The Sunny Room -- capture + planner delivery
// Owned by hello@thesunnyroom.co. List lives in the "Sunny Room List" sheet.

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.website) return out({ ok: true }); // honeypot -- accept silently, save nothing
    var email = String(p.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return out({ ok: false });

    var cache = CacheService.getScriptCache();
    if (cache.get("r:" + email)) return out({ ok: true, dup: true });
    cache.put("r:" + email, "1", 3600);

    var burst = Number(cache.get("burst") || 0);
    if (burst > 30) return out({ ok: false }); // >30 signups/hour = bots, go quiet
    cache.put("burst", String(burst + 1), 3600);

    var sheet = getSheet().getSheets()[0];
    var last = sheet.getLastRow();
    var known = last > 0 ? sheet.getRange(1, 1, last, 1).getValues().join("|") : "";
    if (known.indexOf(email) === -1) {
      sheet.appendRow([email, new Date(), p.source || "site"]);
      sendPlanner(email);
    }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false });
  }
}

function doGet() {
  return out({ ok: true, service: "sunny-room-capture" });
}

function getSheet() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.create("Sunny Room List");
  ss.getSheets()[0].appendRow(["email", "when", "source"]);
  props.setProperty("SHEET_ID", ss.getId());
  return ss;
}

function sendPlanner(email) {
  var files = DriveApp.getFilesByName("sunny-room-planner.pdf");
  var attachments = files.hasNext() ? [files.next().getAs("application/pdf")] : [];
  var text =
    "Hi!\n\n" +
    "Here it is -- The Sunny Room Planner, attached as a printable PDF.\n\n" +
    "It is the same set of sheets I use on my own house: the order of operations that avoids re-doing work, a checklist per room, and budget columns with a spot for the verdict a month later. Print it, stick it on the fridge, scribble on it mid-project.\n\n" +
    "I post my own filled-in sheets -- prices, mistakes, verdicts -- at thesunnyroom.co and on the boards at pinterest.com/thesunnyroom.\n\n" +
    "Happy remodeling,\n" +
    "Casey\n" +
    "The Sunny Room\n\n" +
    "P.S. To stop hearing from me, just reply with the word unsubscribe -- a real person reads this inbox.";
  GmailApp.sendEmail(email, "Your Sunny Room Planner is here", text, {
    name: "Casey at The Sunny Room",
    attachments: attachments
  });
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Run once by hand after pasting: authorizes scopes + creates the sheet.
function setupOnce() {
  getSheet();
  var existing = DriveApp.getFilesByName("sunny-room-planner.pdf");
  if (!existing.hasNext()) {
    var blob = UrlFetchApp
      .fetch("https://raw.githubusercontent.com/Sh-ui/thesunnyroom/main/sunny-room-planner.pdf")
      .getBlob().setName("sunny-room-planner.pdf");
    DriveApp.createFile(blob);
  }
  sendPlanner(Session.getActiveUser().getEmail());
}
