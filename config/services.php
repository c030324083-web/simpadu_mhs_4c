<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'kelompok_1' => [
        'url' => env('API_KELOMPOK_1_URL', 'https://api-admin-4c.rifkiaja.my.id:9002/api'),
    ],

    'kelompok_2' => [
        'url' => env('API_KELOMPOK_2_URL', 'https://api-pegawai-4c.akufarish.my.id:9001/api'),
    ],
    'kelompok_4' => [
        'url' => env('API_KELOMPOK_4_URL', 'https://keuangan4c06.vps-poliban.my.id/api'),
    ],

];
