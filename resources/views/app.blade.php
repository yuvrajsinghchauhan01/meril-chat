<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Meril Chat - AI Assistant</title>
    @vite(['resources/js/main.tsx'])
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
