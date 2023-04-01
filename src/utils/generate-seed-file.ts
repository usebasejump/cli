/**
 * Generates a seed file for the basejump database
 * @param teamAccounts
 * @param personalAccounts
 * @param billingProvider
 */
export default function(teamAccounts: boolean, personalAccounts: boolean, billingProvider: string) {
    return `insert into basejump.config (enable_personal_accounts,
                             enable_team_accounts,
                             enable_account_billing,
                             billing_provider
            ) values (${personalAccounts}, ${teamAccounts}, FALSE, '${billingProvider}');`;
}