<?php

namespace App\Exceptions;

use Exception;

/**
 * Dilempar ketika booking baru overlap dengan booking yang sudah ada
 * untuk unit dan rentang tanggal yang sama.
 *
 * HTTP response: 409 Conflict
 */
class BookingOverlapException extends Exception {}
