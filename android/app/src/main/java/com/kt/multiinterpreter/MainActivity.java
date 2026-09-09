package com.kt.multiinterpreter;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.app.PrintManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://30kimth-arch.github.io/kt-multi-interpreter/";
    private static final int REQUEST_SAVE_TEXT = 4101;

    private WebView webView;
    private WebView printWebView;
    private String pendingText = "";

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        webView.addJavascriptInterface(new AndroidBridge(), "KTAndroid");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleNavigation(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNavigation(Uri.parse(url));
            }
        });

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                        String mimetype, long contentLength) {
                if (url == null || !url.startsWith("http")) return;
                try {
                    String fileName = URLUtil.guessFileName(url, contentDisposition, mimetype);
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    request.setMimeType(mimetype);
                    request.addRequestHeader("User-Agent", userAgent);
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
                    DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    manager.enqueue(request);
                    Toast.makeText(MainActivity.this, "Downloading…", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Download failed", Toast.LENGTH_SHORT).show();
                }
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_URL);
        }
    }

    private boolean handleNavigation(Uri uri) {
        if (uri == null) return false;
        String scheme = uri.getScheme();
        String host = uri.getHost();

        if ("https".equalsIgnoreCase(scheme) &&
                ("30kimth-arch.github.io".equalsIgnoreCase(host) ||
                 "pbanjavtyzcqllpcgizh.supabase.co".equalsIgnoreCase(host))) {
            return false;
        }

        if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
                return true;
            } catch (ActivityNotFoundException ignored) {
                return false;
            }
        }
        return false;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) webView.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    public void onBackPressed() {
        // Do not close the app or leave the current meeting with the Android Back key.
        if (webView != null) {
            webView.evaluateJavascript(
                    "try{if(document.activeElement)document.activeElement.blur();}catch(e){}", null);
        }
    }

    private void startTextSave(String fileName, String content) {
        pendingText = content == null ? "" : content;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("text/plain");
        intent.putExtra(Intent.EXTRA_TITLE, sanitizeFileName(fileName));
        try {
            startActivityForResult(intent, REQUEST_SAVE_TEXT);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "No file saver is available.", Toast.LENGTH_LONG).show();
        }
    }

    private String sanitizeFileName(String name) {
        String safe = (name == null || name.trim().isEmpty()) ? "meeting_minutes.txt" : name;
        safe = safe.replaceAll("[\\\\/:*?\"<>|]", "_");
        if (!safe.toLowerCase().endsWith(".txt")) safe += ".txt";
        return safe;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_SAVE_TEXT && resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri uri = data.getData();
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out != null) {
                    out.write(pendingText.getBytes(StandardCharsets.UTF_8));
                    out.flush();
                    Toast.makeText(this, "Meeting minutes saved.", Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Toast.makeText(this, "Could not save the file.", Toast.LENGTH_LONG).show();
            }
            pendingText = "";
        }
    }

    private void printText(String title, String content) {
        final String docTitle = (title == null || title.trim().isEmpty()) ? "Meeting Minutes" : title;
        String safeText = TextUtils.htmlEncode(content == null ? "" : content).replace("\n", "<br>");
        String html = "<!doctype html><html><head><meta charset='utf-8'>" +
                "<style>@page{size:A4;margin:16mm}body{font-family:sans-serif;font-size:12pt;line-height:1.55;color:#111}" +
                "h1{font-size:20pt;margin-bottom:16px}</style></head><body><h1>" +
                TextUtils.htmlEncode(docTitle) + "</h1><div>" + safeText + "</div></body></html>";

        printWebView = new WebView(this);
        printWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                android.print.PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(docTitle);
                printManager.print(docTitle, adapter, null);
            }
        });
        printWebView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }

    public class AndroidBridge {
        @JavascriptInterface
        public void saveText(String fileName, String content) {
            runOnUiThread(() -> startTextSave(fileName, content));
        }

        @JavascriptInterface
        public void printText(String title, String content) {
            runOnUiThread(() -> MainActivity.this.printText(title, content));
        }

        @JavascriptInterface
        public String platform() {
            return "android";
        }
    }
}
