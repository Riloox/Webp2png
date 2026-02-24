const processingUrls = new Set();

chrome.downloads.onCreated.addListener(async (item) => {
  if (!item || item.byExtensionId === chrome.runtime.id) {
    return;
  }

  const sourceUrl = item.finalUrl || item.url;
  if (!sourceUrl || processingUrls.has(sourceUrl) || !isLikelyWebp(item, sourceUrl)) {
    return;
  }

  processingUrls.add(sourceUrl);

  try {
    await chrome.downloads.cancel(item.id);
    await waitForCancel(item.id);
  } catch (_) {
    processingUrls.delete(sourceUrl);
    return;
  }

  try {
    const pngDataUrl = await convertWebpUrlToPngDataUrl(sourceUrl);
    const filename = toPngName(item.filename, sourceUrl);

    await chrome.downloads.download({
      url: pngDataUrl,
      filename,
      conflictAction: "uniquify",
      saveAs: false
    });
  } catch (_) {
    try {
      await chrome.downloads.download({
        url: sourceUrl,
        filename: fallbackWebpName(item.filename, sourceUrl),
        conflictAction: "uniquify",
        saveAs: false
      });
    } catch (_) {
      // Nothing else to do; both conversion and fallback download failed.
    }
  } finally {
    processingUrls.delete(sourceUrl);
  }
});

function isLikelyWebp(item, url) {
  const lowerName = (item.filename || "").toLowerCase();
  const lowerUrl = url.toLowerCase();
  const mime = (item.mime || "").toLowerCase();

  return (
    lowerName.endsWith(".webp") ||
    lowerUrl.includes(".webp") ||
    mime === "image/webp"
  );
}

function toPngName(filename, url) {
  const base = filename || fileNameFromUrl(url) || "image";
  return forcePngExtension(base);
}

function fallbackWebpName(filename, url) {
  return filename || fileNameFromUrl(url) || "image.webp";
}

function fileNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    return path.split("/").pop() || "";
  } catch (_) {
    return "";
  }
}

function forcePngExtension(path) {
  const cleanPath = path.replace(/[?#].*$/, "");
  const splitIndex = Math.max(cleanPath.lastIndexOf("/"), cleanPath.lastIndexOf("\\"));
  const directory = splitIndex >= 0 ? cleanPath.slice(0, splitIndex + 1) : "";
  const leaf = cleanPath.slice(splitIndex + 1) || "image";
  const dotIndex = leaf.lastIndexOf(".");
  const stem = dotIndex > 0 ? leaf.slice(0, dotIndex) : leaf;

  return `${directory}${stem}.png`;
}

function waitForCancel(downloadId) {
  return new Promise((resolve) => {
    const listener = (delta) => {
      if (delta.id !== downloadId) {
        return;
      }

      if (delta.state && delta.state.current === "interrupted") {
        chrome.downloads.onChanged.removeListener(listener);
        resolve();
      }
    };

    chrome.downloads.onChanged.addListener(listener);

    setTimeout(() => {
      chrome.downloads.onChanged.removeListener(listener);
      resolve();
    }, 400);
  });
}

async function convertWebpUrlToPngDataUrl(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }

  const webpBlob = await response.blob();
  const bitmap = await createImageBitmap(webpBlob);

  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      throw new Error("Could not create 2D context");
    }

    context.drawImage(bitmap, 0, 0);
    const pngBlob = await canvas.convertToBlob({ type: "image/png" });
    return await blobToDataUrl(pngBlob);
  } finally {
    bitmap.close();
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}
