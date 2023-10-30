@extends('layout.app')

@section('title', 'Shorten a link')

@section('content')

    <div class="container">
        <div class="row justify-content-center align-items-center mt-5">
            <div class="col-7">
                <div class="card shadow-sm border-light-subtle">
                    <div class="card-body p-4">

                        @if(session()->has('message'))
                            <div class="alert alert-success" role="alert">
                                {!! session()->get('message') !!}
                            </div>
                        @endif

                        <h3 class="fw-bolder">Shorten a long link</h3>
                        <hr class="border border-light-subtle my-2">

                        <form method="POST" action="{{ route('link.store') }}">
                            @csrf
                            <label for="destination">Destination</label>
                            <input id="destination" value="{{ old('destination') }}" type="text" name="destination"
                                   autocomplete="off"
                                   class="form-control form-control-lg mb-2">

                            @error('destination')
                            <div class="text-danger">{{ $message }}</div>
                            @enderror

                            <button type="submit" class="btn btn-primary mt-2">Create your link!</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

@endsection
