<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority'    => ['required', 'in:low,medium,high'],
            'category'    => ['required', 'string', 'max:100'],
            'status'      => ['sometimes', 'in:open,in_progress,resolved'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'title'       => isset($this->title) ? trim($this->title) : null,
            'description' => isset($this->description) ? trim($this->description) : null,
            'category'    => isset($this->category) ? trim($this->category) : null,
        ]);
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Validation failed.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
