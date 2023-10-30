@if(session()->has('message'))
    <p style="color: limegreen">{!! session()->get('message') !!}</p>
@endif

<form method="POST" action="{{ route('link.store') }}">
    @csrf
    <label for="destination">Destinaton</label>
    <input id="destination" type="text" name="destination">

    @error('destination')
    <div style="color: red">{{ $message }}</div>
    @enderror

    <button type="submit">Create</button>
</form>
