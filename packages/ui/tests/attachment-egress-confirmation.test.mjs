import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sourcePath = new URL("../src/v4/composer/useComposerAttachments.ts", import.meta.url);

test("remote attachments wait for the explicit send action before staging", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.match(
    source,
    /const deferredRemoteStage = Boolean\(target && isRemoteAttachmentTarget\(target\)\)/,
  );
  assert.match(source, /item\.uploadStatus === "queued" && !item\.deferredRemoteStage/);
  const prepareForSend = source.slice(source.indexOf("const prepareForSend"));
  assert.match(prepareForSend, /const deferredRemoteStages = current\.filter/);
  assert.match(prepareForSend, /deferredRemoteStage: false/);
  assert.match(prepareForSend, /if \(target\?\.sessionId\) enqueueUpload\(scopeKey, item\.id\)/);
});
