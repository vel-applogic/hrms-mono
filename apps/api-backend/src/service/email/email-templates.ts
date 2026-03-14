import handlebars from 'handlebars';

// Register Handlebars helpers
handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

handlebars.registerHelper('mod', function (a, b) {
  return a % b;
});

// Base email layout that wraps all email content
const BASE_EMAIL_LAYOUT = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>{{emailTitle}}</title>
<style type="text/css">
    body {
        margin: 0;
        padding: 0;
        min-width: 100% !important;
        font-family: sans-serif;
    }

    img {
        height: auto;
    }

    .content {
        width: 100%;
        max-width: 600px;
    }

    .header {
        padding: 30px 30px 30px 30px;
        text-align: center;
    }

    .innerpadding {
        padding: 30px 30px 30px 30px;
    }

    .borderbottom {
        border-bottom: 1px solid #f2eeed;
    }

    .subhead {
        font-size: 15px;
        color: #ffffff;
        font-family: sans-serif;
        letter-spacing: 10px;
    }

    .h1,
    .h2,
    .bodycopy {
        color: #153643;
        font-family: sans-serif;
    }

    .h1 {
        font-size: 33px;
        line-height: 38px;
        font-weight: bold;
    }

    .h2 {
        padding: 0 0 15px 0;
        font-size: 24px;
        line-height: 28px;
        font-weight: bold;
    }

    .bodycopy {
        font-size: 16px;
        line-height: 22px;
    }

    .button {
        text-align: center;
        font-size: 18px;
        font-family: sans-serif;
        font-weight: bold;
        padding: 0 30px 0 30px;
    }

    .button a {
        color: #000;
        text-decoration: none;
    }

    .footer {
        padding: 20px 30px 15px 30px;
    }

    .footercopy {
        font-family: sans-serif;
        font-size: 14px;
        color: #ffffff;
    }

    .footercopy a {
        color: #ffffff;
        text-decoration: underline;
    }

    .data-table {
        font-size: 15px;
    }

    .data-table td {
        color: #333;
        border-bottom: 1px solid #e1e1e1;
    }

    .data-table th {
        color: #666;
        border-bottom: 1px solid #e1e1e1;
    }

    .details-box {
        margin: 20px 0;
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 5px;
    }

    .details-row {
        padding: 5px 0;
    }

    @media only screen and (max-width: 550px),
    screen and (max-device-width: 550px) {
        body .hide {
            display: none !important;
        }

        body .buttonwrapper {
            background-color: transparent !important;
        }

        body .button {
            padding: 0px !important;
        }

        body .button a {
            background-color: #e05443;
            padding: 15px 15px 13px !important;
        }

        body .unsubscribe {
            display: block;
            margin-top: 20px;
            padding: 10px 50px;
            background: #2f3942;
            border-radius: 5px;
            text-decoration: none !important;
            font-weight: bold;
        }
    }
</style>
</head>

<body bgcolor="#e2eaf1">
<table width="100%" bgcolor="#e2eaf1" border="0" cellpadding="0" cellspacing="0">
    <tr>
        <td>
            <table bgcolor="#ffffff" class="content" align="center" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td bgcolor="#ffffff" class="header borderbottom">
                        <table class="col425" align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td height="70">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td class="h1"
                                                style="padding: 5px 0 5px 0; color:#fff;text-align: center">
                                                <img style="width: 300px" src="{{emailLogoUrl}}" alt="Working away from home" />
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td class="innerpadding borderbottom">
                        <table class="col380" align="left" border="0" cellpadding="0" cellspacing="0"
                            style="width: 100%; max-width: 510px;">
                            <tr>
                                <td>
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td class="bodycopy">
                                                <p>
                                                    Dear {{userDisplayName}},
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                {{{emailContent}}}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="borderbottom" style="padding-bottom: 10px">
                                                <p>
                                                    For more information, please visit our website: <a
                                                        href="https://workingawayfromhome.com">https://workingawayfromhome.com</a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="footer" bgcolor="#44525f">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" class="footercopy">
                                    &copy; Working away from home, {{currentYear}}<br />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>`;

// Email content templates (only the body content specific to each email)

const EMAIL_CONTENT_MAP = {
  SEND_FORGOT_PASSWORD_LINK: `
<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td class="bodycopy">
            <p>
            You have initiated the forgot password request, Please follow the below option to reset your password.
            </p>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0 0 0;">
            <table class="buttonwrapper" bgcolor="#F4DA6F" border="0"
                cellspacing="0" cellpadding="0">
                <tr>
                    <td class="button" height="45">
                        <a href="{{link}}">Reset Password</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding-top: 10px">
            <p>
            Alternatively you can copy and paste this URL into your web browser<br />
            {{ link }}
            </p>
        </td>
    </tr>
</table>`,

  SEND_USER_EMAIL_VERIFY: `
<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td class="bodycopy">
            <p>
            Thanks for registering with us. Please follow the below link to verify your email address.
            </p>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0 0 0;">
            <table class="buttonwrapper" bgcolor="#F4DA6F" border="0"
                cellspacing="0" cellpadding="0">
                <tr>
                    <td class="button" height="45">
                        <a href="{{link}}">Verify Email</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding-top: 10px">
            <p>
            Alternatively you can copy and paste this URL into your web browser<br />
            {{ link }}
            </p>
        </td>
    </tr>
</table>`,

  ACCOUNT_PASSWORD_UPDATED: `
<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td class="bodycopy">
            <p>
                This email is to confirm that your account password has been changed successfully.
            </p>
        </td>
    </tr>
    <tr>
        <td class="bodycopy">
            <p>
                <strong>Updated at:</strong> {{updatedAt}}
            </p>
        </td>
    </tr>
    <tr>
        <td class="bodycopy">
            <p>
                If you did not make this change, please contact our support team immediately to secure your account.
            </p>
        </td>
    </tr>
</table>`,
} as const;

// Helper function to compose email templates
function composeEmailTemplate(contentKey: keyof typeof EMAIL_CONTENT_MAP): (data: Record<string, any>) => string {
  return function (data: Record<string, any>): string {
    const contentTemplate = handlebars.compile(EMAIL_CONTENT_MAP[contentKey]);
    const layoutTemplate = handlebars.compile(BASE_EMAIL_LAYOUT);
    const emailContent = contentTemplate(data);
    return layoutTemplate({ ...data, emailContent });
  };
}

// Template map
export const EMAIL_TEMPLATE_MAP = {
  SEND_FORGOT_PASSWORD_LINK_TEMPLATE: composeEmailTemplate('SEND_FORGOT_PASSWORD_LINK'),
  SEND_USER_EMAIL_VERIFY_TEMPLATE: composeEmailTemplate('SEND_USER_EMAIL_VERIFY'),
  ACCOUNT_PASSWORD_UPDATED_TEMPLATE: composeEmailTemplate('ACCOUNT_PASSWORD_UPDATED'),
} as const;

export type EmailTemplateName = keyof typeof EMAIL_TEMPLATE_MAP;
