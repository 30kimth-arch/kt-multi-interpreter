using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace KTMultiInterpreter;

public sealed class MainForm : Form
{
    private const string AppUrl = "https://30kimth-arch.github.io/kt-multi-interpreter/";
    private readonly WebView2 webView = new();
    private readonly Label status = new();

    public MainForm()
    {
        Text = "KT Multi Interpreter";
        StartPosition = FormStartPosition.CenterScreen;
        Width = 1280;
        Height = 820;
        MinimumSize = new Size(900, 620);
        BackColor = Color.White;

        status.Dock = DockStyle.Fill;
        status.TextAlign = ContentAlignment.MiddleCenter;
        status.Font = new Font("Segoe UI", 12F, FontStyle.Regular);
        status.Text = "KT Multi Interpreter loading...";
        Controls.Add(status);

        webView.Dock = DockStyle.Fill;
        webView.Visible = false;
        Controls.Add(webView);

        Shown += async (_, _) => await InitializeWebViewAsync();
        FormClosing += (_, _) => webView.CoreWebView2?.Profile?.ClearBrowsingDataAsync(CoreWebView2BrowsingDataKinds.DiskCache);
    }

    private async Task InitializeWebViewAsync()
    {
        try
        {
            string userData = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "KT Multi Interpreter",
                "WebView2");
            Directory.CreateDirectory(userData);

            CoreWebView2Environment env = await CoreWebView2Environment.CreateAsync(null, userData);
            await webView.EnsureCoreWebView2Async(env);

            webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
            webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            webView.CoreWebView2.Settings.IsZoomControlEnabled = true;

            webView.CoreWebView2.NavigationStarting += (_, e) =>
            {
                status.Text = "Connecting...";
            };

            webView.CoreWebView2.NavigationCompleted += (_, e) =>
            {
                if (e.IsSuccess)
                {
                    status.Visible = false;
                    webView.Visible = true;
                }
                else
                {
                    webView.Visible = false;
                    status.Visible = true;
                    status.Text = "Could not connect. Check the Internet connection and run the app again.";
                }
            };

            webView.CoreWebView2.NewWindowRequested += (_, e) =>
            {
                if (!string.IsNullOrWhiteSpace(e.Uri))
                {
                    try
                    {
                        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                        {
                            FileName = e.Uri,
                            UseShellExecute = true
                        });
                        e.Handled = true;
                    }
                    catch
                    {
                        e.Handled = false;
                    }
                }
            };

            webView.CoreWebView2.DownloadStarting += (_, e) =>
            {
                try
                {
                    string downloads = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                        "Downloads");
                    Directory.CreateDirectory(downloads);
                    string fileName = Path.GetFileName(e.ResultFilePath);
                    if (string.IsNullOrWhiteSpace(fileName)) fileName = "KT_Multi_Interpreter_Download";
                    e.ResultFilePath = Path.Combine(downloads, fileName);
                }
                catch
                {
                    // Keep WebView2's default download path.
                }
            };

            webView.Source = new Uri(AppUrl);
        }
        catch (WebView2RuntimeNotFoundException)
        {
            ShowRuntimeError();
        }
        catch (Exception ex)
        {
            webView.Visible = false;
            status.Visible = true;
            status.Text = "KT Multi Interpreter could not start.\n\n" + ex.Message;
        }
    }

    private void ShowRuntimeError()
    {
        webView.Visible = false;
        status.Visible = true;
        status.Text = "Microsoft Edge WebView2 Runtime is required.\nInstall Microsoft Edge/WebView2, then run KT Multi Interpreter again.";
    }
}
