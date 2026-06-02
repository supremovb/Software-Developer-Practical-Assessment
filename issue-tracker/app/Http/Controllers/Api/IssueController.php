<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIssueRequest;
use App\Http\Requests\UpdateIssueRequest;
use App\Http\Resources\IssueResource;
use App\Jobs\GenerateSummaryJob;
use App\Models\Issue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class IssueController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Issue::withCount('comments');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->boolean('needs_attention')) {
            $query->where('needs_attention', true);
        }

        $sortBy        = in_array($request->input('sort_by'), ['created_at', 'updated_at', 'priority', 'status'])
            ? $request->input('sort_by')
            : 'created_at';
        $sortDirection = $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc';

        $issues = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($request->integer('per_page', 15));

        return IssueResource::collection($issues);
    }

    public function store(StoreIssueRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status']          = $data['status'] ?? 'open';
        $data['summary_status']  = 'pending';
        $data['needs_attention'] = ($data['priority'] === 'high');

        $issue = Issue::create($data);

        GenerateSummaryJob::dispatch($issue);

        return (new IssueResource($issue))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Issue $issue): IssueResource
    {
        $issue->loadMissing('comments');
        return new IssueResource($issue);
    }

    public function update(UpdateIssueRequest $request, Issue $issue): IssueResource
    {
        $data = $request->validated();

        $descriptionChanged = isset($data['description'])
            && $data['description'] !== $issue->description;

        $issue->fill($data);

        if (isset($data['priority'])) {
            $issue->needs_attention = ($data['priority'] === 'high');
        }

        $issue->save();

        if ($descriptionChanged) {
            $issue->summary_status = 'pending';
            $issue->summary        = null;
            $issue->suggested_next_action = null;
            $issue->saveQuietly();

            GenerateSummaryJob::dispatch($issue);
        }

        return new IssueResource($issue);
    }
}
