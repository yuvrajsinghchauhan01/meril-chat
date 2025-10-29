<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('models', function (Blueprint $table) {
            $table->id();
            $table->string('model_id')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('pricing')->nullable();
            $table->integer('context_length')->nullable();
            $table->json('architecture')->nullable();
            $table->string('top_provider')->nullable();
            $table->json('per_request_limits')->nullable();
            $table->string('category')->nullable();
            $table->string('provider')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->timestamp('last_synced_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('models');
    }
};