insert into basejump.config (enable_personal_accounts,
                             enable_team_accounts,
                             enable_account_billing,
                             billing_provider
) values ({{personalAccounts}}, {{teamAccounts}}, FALSE, '{{billingProvider}}');